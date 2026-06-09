package com.cuet.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private Long    resourceId;
    private String  name;
    private String  type;
    private Integer capacity;
    private boolean indoor;
    private LocalTime openTime;
    private LocalTime closeTime;
    private Long    teacherInChargeId;
    private String  teacherInChargeName;
}
