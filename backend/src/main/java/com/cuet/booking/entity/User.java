package com.cuet.booking.entity;

import com.cuet.booking.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank
    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * Bookings made by this user when they are a student.
     */
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> studentBookings;

    /**
     * Bookings where this user is listed as the reference teacher.
     */
    @OneToMany(mappedBy = "referenceTeacher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> referenceTeacherBookings;

    /**
     * Resources for which this user is the teacher-in-charge.
     */
    @OneToMany(mappedBy = "teacherInCharge", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Resource> managedResources;
}
