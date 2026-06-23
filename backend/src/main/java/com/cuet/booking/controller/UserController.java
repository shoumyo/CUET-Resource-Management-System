package com.cuet.booking.controller;

import com.cuet.booking.entity.User;
import com.cuet.booking.enums.Role;
import com.cuet.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.of(
                        "id", (Object) u.getUserId(),
                        "name", u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
