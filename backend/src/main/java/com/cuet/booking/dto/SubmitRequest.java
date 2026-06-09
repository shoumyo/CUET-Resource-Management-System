package com.cuet.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitRequest {
    /** The ID of the reference teacher nominated by the student */
    @NotNull(message = "Reference teacher ID is required")
    private Long referenceTeacherId;
}
