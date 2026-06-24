package com.cuet.booking.service;

import com.cuet.booking.dto.BookingRequest;
import com.cuet.booking.dto.BookingResponse;
import com.cuet.booking.entity.Booking;
import com.cuet.booking.entity.Resource;
import com.cuet.booking.entity.User;
import com.cuet.booking.enums.BookingStatus;
import com.cuet.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final UserService userService;

    // ─────────────────────────────────────────────────────
    // Student Actions
    // ─────────────────────────────────────────────────────

    @Transactional
    public BookingResponse createHold(BookingRequest req, Long studentId) {
        User student = userService.getById(studentId);
        
        // 1. Validate email ends with @cuet.ac.bd
        if (!student.getEmail().toLowerCase().endsWith("@cuet.ac.bd")) {
            throw new IllegalArgumentException("Only @cuet.ac.bd users can make bookings.");
        }

        Resource resource = resourceService.getResourceById(req.getResourceId());
        LocalDateTime startTime = req.getStartTime();
        LocalDateTime endTime = req.getEndTime();
        LocalDateTime now = LocalDateTime.now();

        // 2. Validate booking is for tomorrow or later
        if (!startTime.toLocalDate().isAfter(now.toLocalDate())) {
            throw new IllegalArgumentException("Bookings must be for tomorrow or a future date.");
        }

        // 3. Validate duration >= 1 hour
        long durationHours = ChronoUnit.HOURS.between(startTime, endTime);
        if (durationHours < 1) {
            throw new IllegalArgumentException("Booking duration must be at least 1 hour.");
        }

        // 4. bufferEndTime = endTime (no extra buffer)
        LocalDateTime bufferEndTime = endTime;

        // 5. Validate operational hours for indoor venues
        if (resource.isIndoor()) {
            LocalTime startLocalTime = startTime.toLocalTime();
            LocalTime endLocalTime = endTime.toLocalTime();

            if (startLocalTime.isBefore(LocalTime.of(9, 0)) || endLocalTime.isAfter(LocalTime.of(20, 0))) {
                throw new IllegalArgumentException(
                    "Indoor venues are only operational from 09:00 to 20:00."
                );
            }
        }

        // 6. Overlap detection using bufferEndTime
        boolean hasConflict = bookingRepository.existsConflict(resource.getResourceId(), startTime, bufferEndTime);
        if (hasConflict) {
            throw new IllegalStateException("The requested time slot conflicts with an existing booking's buffer time.");
        }

        // 7. Save as HELD
        Booking booking = Booking.builder()
                .resource(resource)
                .student(student)
                .startTime(startTime)
                .endTime(endTime)
                .bufferEndTime(bufferEndTime)
                .purpose(req.getPurpose())
                .status(BookingStatus.HELD)
                .heldAt(now)
                .build();

        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse submitBooking(Long bookingId, Long studentId, Long refTeacherId) {
        Booking booking = getBookingAndVerifyStudent(bookingId, studentId);
        
        if (booking.getStatus() != BookingStatus.HELD) {
            throw new IllegalStateException("Only HELD bookings can be submitted.");
        }

        User refTeacher = userService.getById(refTeacherId);
        booking.setReferenceTeacher(refTeacher);
        booking.setStatus(BookingStatus.PENDING_REFERENCE);

        return mapToResponse(bookingRepository.save(booking));
    }

    public List<BookingResponse> getStudentBookings(Long studentId) {
        return bookingRepository.findAllByStudent_UserId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsForResourceOnDate(Long resourceId, String dateStr) {
        java.time.LocalDate date = java.time.LocalDate.parse(dateStr);
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(23, 59, 59);
        
        List<BookingStatus> activeStatuses = java.util.List.of(
            BookingStatus.HELD, BookingStatus.PENDING_REFERENCE,
            BookingStatus.PENDING_ADMIN, BookingStatus.CONFIRMED
        );
        
        return bookingRepository.findAll().stream()
                .filter(b -> b.getResource().getResourceId().equals(resourceId))
                .filter(b -> activeStatuses.contains(b.getStatus()))
                .filter(b -> {
                    // Check if booking overlaps with the given date
                    return !b.getEndTime().isBefore(dayStart) && !b.getStartTime().isAfter(dayEnd);
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────
    // Teacher Actions
    // ─────────────────────────────────────────────────────

    public List<BookingResponse> getPendingReferenceBookings(Long teacherId) {
        return bookingRepository.findAllByReferenceTeacher_UserIdAndStatus(teacherId, BookingStatus.PENDING_REFERENCE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse teacherApprove(Long bookingId, Long teacherId) {
        Booking booking = getBookingAndVerifyRefTeacher(bookingId, teacherId);
        if (booking.getStatus() != BookingStatus.PENDING_REFERENCE) {
            throw new IllegalStateException("Booking is not pending reference approval.");
        }
        booking.setStatus(BookingStatus.PENDING_ADMIN);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse teacherReject(Long bookingId, Long teacherId) {
        Booking booking = getBookingAndVerifyRefTeacher(bookingId, teacherId);
        if (booking.getStatus() != BookingStatus.PENDING_REFERENCE) {
            throw new IllegalStateException("Booking is not pending reference approval.");
        }
        booking.setStatus(BookingStatus.REJECTED);
        return mapToResponse(bookingRepository.save(booking));
    }

    // ─────────────────────────────────────────────────────
    // Admin Actions
    // ─────────────────────────────────────────────────────

    public List<BookingResponse> getPendingAdminBookings(Long adminId) {
        // Return ALL pending-admin bookings system-wide (true admin access)
        return bookingRepository.findAllByStatusIn(java.util.List.of(BookingStatus.PENDING_ADMIN)).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllAdminBookings(Long adminId) {
        return bookingRepository.findAllByResource_TeacherInCharge_UserId(adminId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse adminApprove(Long bookingId, Long adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING_ADMIN) {
            throw new IllegalStateException("Booking is not pending admin approval.");
        }
        
        booking.setStatus(BookingStatus.CONFIRMED);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse adminReject(Long bookingId, Long adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getStatus() != BookingStatus.PENDING_ADMIN) {
            throw new IllegalStateException("Booking is not pending admin approval.");
        }
        booking.setStatus(BookingStatus.REJECTED);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Transactional
    public void studentCancelBooking(Long bookingId, Long studentId) {
        Booking booking = getBookingAndVerifyStudent(bookingId, studentId);

        if (booking.getStatus() != BookingStatus.HELD && booking.getStatus() != BookingStatus.PENDING_REFERENCE) {
            throw new IllegalStateException("You can only cancel bookings that are HELD or PENDING_REFERENCE. Once the reference teacher has approved, cancellation is no longer allowed.");
        }

        bookingRepository.delete(booking);
    }

    @Transactional
    public void deleteBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        bookingRepository.delete(booking);
    }

    // ─────────────────────────────────────────────────────
    // Scheduler: 5-Minute Hold Expiry
    // ─────────────────────────────────────────────────────

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void expireHeldBookings() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        List<Booking> staleHolds = bookingRepository.findAllByStatusAndHeldAtBefore(BookingStatus.HELD, cutoff);
        
        for (Booking b : staleHolds) {
            b.setStatus(BookingStatus.TIMEOUT);
        }
        if (!staleHolds.isEmpty()) {
            bookingRepository.saveAll(staleHolds);
            System.out.println("Expired " + staleHolds.size() + " HELD bookings due to timeout.");
        }
    }

    // ─────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────

    private Booking getBookingAndVerifyStudent(Long bookingId, Long studentId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getStudent().getUserId().equals(studentId)) {
            throw new IllegalStateException("Not authorized to modify this booking");
        }
        return booking;
    }

    private Booking getBookingAndVerifyRefTeacher(Long bookingId, Long teacherId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getReferenceTeacher() == null || !booking.getReferenceTeacher().getUserId().equals(teacherId)) {
            throw new IllegalStateException("Not authorized to approve this booking as reference teacher");
        }
        return booking;
    }

    private Booking getBookingAndVerifyAdmin(Long bookingId, Long adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getResource().getTeacherInCharge() == null || 
            !booking.getResource().getTeacherInCharge().getUserId().equals(adminId)) {
            throw new IllegalStateException("Not authorized to approve this booking as teacher-in-charge");
        }
        return booking;
    }

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .bookingId(b.getBookingId())
                .status(b.getStatus().name())
                .purpose(b.getPurpose())
                .resourceId(b.getResource().getResourceId())
                .resourceName(b.getResource().getName())
                .resourceType(b.getResource().getType())
                .studentId(b.getStudent().getUserId())
                .studentName(b.getStudent().getName())
                .studentEmail(b.getStudent().getEmail())
                .referenceTeacherId(b.getReferenceTeacher() != null ? b.getReferenceTeacher().getUserId() : null)
                .referenceTeacherName(b.getReferenceTeacher() != null ? b.getReferenceTeacher().getName() : null)
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .bufferEndTime(b.getBufferEndTime())
                .heldAt(b.getHeldAt())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
