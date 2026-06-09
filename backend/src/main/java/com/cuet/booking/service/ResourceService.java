package com.cuet.booking.service;

import com.cuet.booking.dto.ResourceResponse;
import com.cuet.booking.entity.Resource;
import com.cuet.booking.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
    }

    private ResourceResponse mapToResponse(Resource r) {
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
                .build();
    }
}
