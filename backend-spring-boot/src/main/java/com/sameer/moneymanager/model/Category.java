package com.sameer.moneymanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryType type; // INCOME, EXPENSE

    private String icon;
    private String colorHex;

    @Column(precision = 15, scale = 2)
    private BigDecimal monthlyBudget = BigDecimal.ZERO;

    public enum CategoryType {
        INCOME, EXPENSE
    }
}
