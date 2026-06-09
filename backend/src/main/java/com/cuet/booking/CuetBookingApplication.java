package com.cuet.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CuetBookingApplication {
    public static void main(String[] args) {
        SpringApplication.run(CuetBookingApplication.class, args);
    }
}
