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
    private final com.cuet.booking.service.UserService userService;
    private final com.cuet.booking.security.JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyProfile(jakarta.servlet.http.HttpServletRequest request) {
        Long userId = extractUserId(request);
        User u = userService.getById(userId);
        return ResponseEntity.ok(Map.of(
                "id", u.getUserId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole().name()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMyProfile(@RequestBody com.cuet.booking.dto.ProfileUpdateRequest req, jakarta.servlet.http.HttpServletRequest request) {
        Long userId = extractUserId(request);
        User u = userService.updateProfile(userId, req);
        return ResponseEntity.ok(Map.of(
                "id", u.getUserId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole().name(),
                "message", "Profile updated successfully"
        ));
    }

    private Long extractUserId(jakarta.servlet.http.HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtil.extractUserId(authHeader.substring(7));
        }
        throw new IllegalStateException("Not authorized");
    }

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
