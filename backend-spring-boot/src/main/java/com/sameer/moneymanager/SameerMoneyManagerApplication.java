package com.sameer.moneymanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SameerMoneyManagerApplication {
    public static void main(String[] args) {
        System.out.println("============================================================================");
        System.out.println("  SAMEER'S MONEY MANAGER - Personal Finance Control Center");
        System.out.println("  Your Money. Your Control. Your Future.");
        System.out.println("  Welcome SAMEER!");
        System.out.println("============================================================================");
        SpringApplication.run(SameerMoneyManagerApplication.class, args);
    }
}
