package com.cuet.booking.controller;

import com.cuet.booking.dto.ResourceResponse;
import com.cuet.booking.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        // Can add mapping in ResourceService, but assuming getAllResources covers most.
        // Let's rely on getAllResources for now.
        return ResponseEntity.notFound().build();
    }
}
