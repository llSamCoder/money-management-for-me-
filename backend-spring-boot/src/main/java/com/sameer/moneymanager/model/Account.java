package com.sameer.moneymanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String accountName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountType accountType; // BANK, CASH, UPI, CREDIT_CARD, WALLET

    private String accountNumberLast4;
    private String institutionName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    private Integer billingCycleDay;
    private String colorHex;
    private String iconName;
    private Boolean isActive = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum AccountType {
        BANK, CASH, UPI, CREDIT_CARD, DEBIT_CARD, WALLET
    }
}
