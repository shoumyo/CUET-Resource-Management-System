package com.cuet.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long   bookingId;
    private String status;
    private String purpose;

    // Resource info
    private Long   resourceId;
    private String resourceName;
    private String resourceType;

    // Student info
    private Long   studentId;
    private String studentName;
    private String studentEmail;

    // Reference teacher info
    private Long   referenceTeacherId;
    private String referenceTeacherName;

    // Times
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime bufferEndTime;
    private LocalDateTime heldAt;
    private LocalDateTime createdAt;
}
