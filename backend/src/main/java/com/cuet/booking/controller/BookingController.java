package com.cuet.booking.controller;

import com.cuet.booking.dto.BookingRequest;
import com.cuet.booking.dto.BookingResponse;
import com.cuet.booking.dto.SubmitRequest;
import com.cuet.booking.security.JwtUtil;
import com.cuet.booking.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ─────────────────────────────────────────────────────
    // Student Endpoints
    // ─────────────────────────────────────────────────────

    @PostMapping("/hold")
    public ResponseEntity<BookingResponse> createHold(@Valid @RequestBody BookingRequest req, HttpServletRequest request) {
        Long studentId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.createHold(req, studentId));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<BookingResponse> submitBooking(@PathVariable Long id, @Valid @RequestBody SubmitRequest req, HttpServletRequest request) {
        Long studentId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.submitBooking(id, studentId, req.getReferenceTeacherId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(HttpServletRequest request) {
        Long studentId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.getStudentBookings(studentId));
    }

    // ─────────────────────────────────────────────────────
    // Teacher Endpoints
    // ─────────────────────────────────────────────────────

    @GetMapping("/pending-reference")
    public ResponseEntity<List<BookingResponse>> getPendingReferenceBookings(HttpServletRequest request) {
        Long teacherId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.getPendingReferenceBookings(teacherId));
    }

    @PutMapping("/{id}/teacher-approve")
    public ResponseEntity<BookingResponse> teacherApprove(@PathVariable Long id, HttpServletRequest request) {
        Long teacherId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.teacherApprove(id, teacherId));
    }

    @PutMapping("/{id}/teacher-reject")
    public ResponseEntity<BookingResponse> teacherReject(@PathVariable Long id, HttpServletRequest request) {
        Long teacherId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.teacherReject(id, teacherId));
    }

    // ─────────────────────────────────────────────────────
    // Admin Endpoints
    // ─────────────────────────────────────────────────────

    @GetMapping("/pending-admin")
    public ResponseEntity<List<BookingResponse>> getPendingAdminBookings(HttpServletRequest request) {
        Long adminId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.getPendingAdminBookings(adminId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<BookingResponse>> getAllAdminBookings(HttpServletRequest request) {
        Long adminId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.getAllAdminBookings(adminId));
    }

    @PutMapping("/{id}/admin-approve")
    public ResponseEntity<BookingResponse> adminApprove(@PathVariable Long id, HttpServletRequest request) {
        Long adminId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.adminApprove(id, adminId));
    }

    @PutMapping("/{id}/admin-reject")
    public ResponseEntity<BookingResponse> adminReject(@PathVariable Long id, HttpServletRequest request) {
        Long adminId = getUserIdFromRequest(request);
        return ResponseEntity.ok(bookingService.adminReject(id, adminId));
    }
}
