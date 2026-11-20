package com.sameer.moneymanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "debts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Debt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String personName;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DebtType debtType; // GIVEN (Receivable), TAKEN (Payable)

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal initialAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal pendingAmount;

    @Column(nullable = false)
    private LocalDate givenOrTakenDate;

    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    private String notes;

    @Enumerated(EnumType.STRING)
    private DebtStatus status = DebtStatus.PENDING;

    public enum DebtType {
        GIVEN, TAKEN
    }

    public enum DebtStatus {
        PENDING, PARTIALLY_PAID, SETTLED, DEFAULTED
    }
}
