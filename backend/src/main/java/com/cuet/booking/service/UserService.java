package com.cuet.booking.service;

import com.cuet.booking.dto.AuthResponse;
import com.cuet.booking.dto.LoginRequest;
import com.cuet.booking.dto.RegisterRequest;
import com.cuet.booking.entity.User;
import com.cuet.booking.enums.Role;
import com.cuet.booking.repository.UserRepository;
import com.cuet.booking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository       userRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtUtil              jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsService   userDetailsService;

    private static final String CUET_EMAIL_SUFFIX = "@cuet.ac.bd";

    // ─────────────────────────────────────────────────────
    // Register
    // ─────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest req) {
        // 1. Validate CUET email domain
        if (!req.getEmail().toLowerCase().endsWith(CUET_EMAIL_SUFFIX)) {
            throw new IllegalArgumentException(
                    "Only @cuet.ac.bd email addresses are permitted."
            );
        }

        // 2. Check email uniqueness
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("Email already registered: " + req.getEmail());
        }

        // 3. Parse role
        Role role;
        try {
            role = Role.valueOf(req.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role. Must be STUDENT, TEACHER, or ADMIN.");
        }

        // 4. Persist
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .build();
        userRepository.save(user);

        // 5. Generate token
        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(ud, user.getUserId(), role.name());

        return buildAuthResponse(token, user);
    }

    // ─────────────────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(ud, user.getUserId(), user.getRole().name());

        return buildAuthResponse(token, user);
    }

    // ─────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────

    public User getById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    public User updateProfile(Long userId, com.cuet.booking.dto.ProfileUpdateRequest req) {
        User user = getById(userId);
        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        return userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
