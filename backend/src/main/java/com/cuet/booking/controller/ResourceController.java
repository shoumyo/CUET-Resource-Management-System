package com.cuet.booking.controller;

import com.cuet.booking.dto.ResourceResponse;
import com.cuet.booking.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String type = (String) body.get("type");
        Integer capacity = body.get("capacity") != null ? ((Number) body.get("capacity")).intValue() : null;
        boolean indoor = body.get("indoor") != null && (boolean) body.get("indoor");
        String openTime = (String) body.get("openTime");
        String closeTime = (String) body.get("closeTime");

        return ResponseEntity.ok(resourceService.createResource(name, type, capacity, indoor, openTime, closeTime));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String type = (String) body.get("type");
        Integer capacity = body.get("capacity") != null ? ((Number) body.get("capacity")).intValue() : null;
        boolean indoor = body.get("indoor") != null && (boolean) body.get("indoor");
        String openTime = (String) body.get("openTime");
        String closeTime = (String) body.get("closeTime");

        return ResponseEntity.ok(resourceService.updateResource(id, name, type, capacity, indoor, openTime, closeTime));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
