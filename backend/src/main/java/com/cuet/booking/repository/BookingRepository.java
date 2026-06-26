package com.cuet.booking.repository;

import com.cuet.booking.entity.Booking;
import com.cuet.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /* ──────────────────────────────────────────────
     * Student queries
     * ────────────────────────────────────────────── */

    List<Booking> findAllByStudent_UserId(Long studentId);

    /* ──────────────────────────────────────────────
     * Teacher queries
     * ────────────────────────────────────────────── */

    /** Bookings awaiting the reference teacher's decision */
    List<Booking> findAllByReferenceTeacher_UserIdAndStatus(Long teacherId, BookingStatus status);

    /** All bookings where the user was the reference teacher (for history) */
    List<Booking> findAllByReferenceTeacher_UserId(Long teacherId);

    /* ──────────────────────────────────────────────
     * Admin / Teacher-in-charge queries
     * ────────────────────────────────────────────── */

    /** All bookings for resources managed by this teacher-in-charge */
    List<Booking> findAllByResource_TeacherInCharge_UserIdAndStatus(Long adminId, BookingStatus status);

    List<Booking> findAllByResource_TeacherInCharge_UserId(Long adminId);

    List<Booking> findAllByStatusIn(List<BookingStatus> statuses);

    /* ──────────────────────────────────────────────
     * Scheduler: find stale HELD bookings
     * ────────────────────────────────────────────── */

    List<Booking> findAllByStatusAndHeldAtBefore(BookingStatus status, LocalDateTime cutoff);

    /* ──────────────────────────────────────────────
     * Availability / Overlap Detection
     * Uses buffer_end_time for the existing booking, start_time for the new one.
     *
     * A conflict exists when:
     *   new.startTime  < existing.bufferEndTime
     *   AND
     *   new.bufferEndTime > existing.startTime
     * ────────────────────────────────────────────── */

    @Query("""
            SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
            FROM Booking b
            WHERE b.resource.resourceId = :resourceId
              AND b.status IN ('HELD','PENDING_REFERENCE','PENDING_ADMIN','CONFIRMED')
              AND b.startTime < :newBufferEnd
              AND b.bufferEndTime > :newStart
            """)
    boolean existsConflict(
            @Param("resourceId") Long resourceId,
            @Param("newStart")   LocalDateTime newStart,
            @Param("newBufferEnd") LocalDateTime newBufferEnd
    );

    /** Returns confirmed bookings for a resource on a specific date (for calendar view) */
    @Query("""
            SELECT b FROM Booking b
            WHERE b.resource.resourceId = :resourceId
              AND b.status = 'CONFIRMED'
              AND CAST(b.startTime AS date) = CAST(:date AS date)
            ORDER BY b.startTime
            """)
    List<Booking> findConfirmedBookingsByResourceAndDate(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDateTime date
    );
}
