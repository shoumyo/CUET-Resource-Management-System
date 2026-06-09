package com.cuet.booking.enums;

public enum BookingStatus {
    /** Student initiated — 5-min window to submit with teacher reference */
    HELD,
    /** Student submitted reference teacher; awaiting teacher approval */
    PENDING_REFERENCE,
    /** Reference teacher approved; awaiting teacher-in-charge (admin) approval */
    PENDING_ADMIN,
    /** Fully approved — booking confirmed */
    CONFIRMED,
    /** Rejected by any approver */
    REJECTED,
    /** HELD expired after 5 minutes without submission */
    TIMEOUT
}
