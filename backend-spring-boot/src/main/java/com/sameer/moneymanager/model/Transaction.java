package com.sameer.moneymanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_account_id")
    private Account destinationAccount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType transactionType; // INCOME, EXPENSE, TRANSFER, DEBT_GIVEN, DEBT_TAKEN

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate transactionDate;

    private String payeeOrPayer;
    private String notes;
    private String paymentMode;
    private String referenceNumber;
    private String receiptUrl;
    private Boolean isRecurring = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransactionType {
        INCOME, EXPENSE, TRANSFER, DEBT_GIVEN, DEBT_TAKEN, INVESTMENT
    }
}
