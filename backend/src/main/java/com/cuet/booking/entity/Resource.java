package com.cuet.booking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceId;

    @Column(unique = true, nullable = false)
    private String name;

    /** e.g. "Auditorium", "Gallery", "Field" */
    private String type;

    private Integer capacity;

    /**
     * True for: East Gallery, West Gallery, Auditorium, TSC 3rd Floor.
     * False for: Basketball Ground, Central Field.
     */
    @Column(nullable = false)
    private boolean indoor;

    /**
     * Operational open time (09:00 for indoor venues, null for outdoor).
     */
    private LocalTime openTime;

    /**
     * Operational close time (20:00 for indoor venues, null for outdoor).
     * This is the ABSOLUTE latest buffer_end_time can reach.
     */
    private LocalTime closeTime;

    /**
     * Teacher-in-charge who gives final approval for this resource's bookings.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_in_charge_id")
    private User teacherInCharge;

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;
}
