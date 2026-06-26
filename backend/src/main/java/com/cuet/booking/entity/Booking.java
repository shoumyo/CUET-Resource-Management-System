package com.cuet.booking.entity;

import com.cuet.booking.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    /** The resource being booked */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    /** The student who made the booking */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    /**
     * The reference teacher nominated by the student.
     * Nullable until student submits (HELD → PENDING_REFERENCE).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_teacher_id")
    private User referenceTeacher;

    /** Booking start time — must be > now + 24h */
    @Column(nullable = false)
    private LocalDateTime startTime;

    /** Booking end time — must be >= startTime + 2h */
    @Column(nullable = false)
    private LocalDateTime endTime;

    /**
     * Buffer end time = endTime + 2h.
     * Overlap detection uses this column, not endTime.
     */
    @Column(nullable = false)
    private LocalDateTime bufferEndTime;

    /** Brief description of purpose */
    @Column(columnDefinition = "TEXT")
    private String purpose;

    /** Note/reason from teacher upon approval/rejection */
    @Column(columnDefinition = "TEXT")
    private String teacherRemarks;

    /** Note/reason from admin upon approval/rejection */
    @Column(columnDefinition = "TEXT")
    private String adminRemarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    /**
     * Timestamp when the HELD status was set.
     * Used by the scheduler to detect 5-minute expiry.
     */
    private LocalDateTime heldAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
