package com.cuet.booking.controller;

import com.cuet.booking.entity.User;
import com.cuet.booking.enums.Role;
import com.cuet.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/teachers")
    public ResponseEntity<List<Map<String, Object>>> getAllTeachers() {
        List<Map<String, Object>> teachers = userRepository.findAllByRole(Role.TEACHER).stream()
                .map(t -> Map.of(
                        "id", (Object) t.getUserId(),
                        "name", t.getName(),
                        "email", t.getEmail()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(teachers);
    }
}
