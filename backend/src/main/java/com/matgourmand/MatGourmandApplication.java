package com.matgourmand;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MatGourmandApplication {

    public static void main(String[] args) {
        SpringApplication.run(MatGourmandApplication.class, args);
    }

}
