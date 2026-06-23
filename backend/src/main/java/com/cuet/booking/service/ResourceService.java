package com.cuet.booking.service;

import com.cuet.booking.dto.ResourceResponse;
import com.cuet.booking.entity.Booking;
import com.cuet.booking.entity.Resource;
import com.cuet.booking.enums.BookingStatus;
import com.cuet.booking.repository.BookingRepository;
import com.cuet.booking.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public List<ResourceResponse> getAllResources() {
        LocalDateTime now = LocalDateTime.now();
        return resourceRepository.findAllByOrderByNameAsc().stream()
                .map(r -> mapToResponse(r, now))
                .collect(Collectors.toList());
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
    }

    @Transactional
    public ResourceResponse createResource(String name, String type, Integer capacity,
                                           boolean indoor, String openTime, String closeTime) {
        Resource resource = Resource.builder()
                .name(name)
                .type(type)
                .capacity(capacity)
                .indoor(indoor)
                .openTime(openTime != null ? java.time.LocalTime.parse(openTime) : null)
                .closeTime(closeTime != null ? java.time.LocalTime.parse(closeTime) : null)
                .build();
        return mapToResponse(resourceRepository.save(resource), LocalDateTime.now());
    }

    @Transactional
    public ResourceResponse updateResource(Long id, String name, String type, Integer capacity,
                                           boolean indoor, String openTime, String closeTime) {
        Resource resource = getResourceById(id);
        if (name != null) resource.setName(name);
        if (type != null) resource.setType(type);
        if (capacity != null) resource.setCapacity(capacity);
        resource.setIndoor(indoor);
        resource.setOpenTime(openTime != null ? java.time.LocalTime.parse(openTime) : null);
        resource.setCloseTime(closeTime != null ? java.time.LocalTime.parse(closeTime) : null);
        return mapToResponse(resourceRepository.save(resource), LocalDateTime.now());
    }

    @Transactional
    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }

    private boolean isCurrentlyAvailable(Resource r, LocalDateTime now) {
        // Check if there are any active bookings overlapping with "now"
        List<Booking> bookings = r.getBookings();
        if (bookings == null || bookings.isEmpty()) return true;

        return bookings.stream().noneMatch(b -> {
            BookingStatus status = b.getStatus();
            boolean isActiveStatus = status == BookingStatus.HELD
                    || status == BookingStatus.PENDING_REFERENCE
                    || status == BookingStatus.PENDING_ADMIN
                    || status == BookingStatus.CONFIRMED;
            if (!isActiveStatus) return false;
            // Check if now falls within startTime and bufferEndTime
            return !now.isBefore(b.getStartTime()) && now.isBefore(b.getBufferEndTime());
        });
    }

    private ResourceResponse mapToResponse(Resource r, LocalDateTime now) {
        return ResourceResponse.builder()
                .resourceId(r.getResourceId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .indoor(r.isIndoor())
                .openTime(r.getOpenTime())
                .closeTime(r.getCloseTime())
                .teacherInChargeId(r.getTeacherInCharge() != null ? r.getTeacherInCharge().getUserId() : null)
                .teacherInChargeName(r.getTeacherInCharge() != null ? r.getTeacherInCharge().getName() : null)
                .currentlyAvailable(isCurrentlyAvailable(r, now))
                .build();
    }
}
