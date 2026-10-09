package com.sanctions.screening;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SanctionsScreeningApplication {

    public static void main(String[] args) {
        SpringApplication.run(SanctionsScreeningApplication.class, args);
    }
}
