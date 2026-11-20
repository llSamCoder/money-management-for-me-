package com.sameer.moneymanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "investments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String investmentName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssetType assetType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal investedAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal currentValue;

    @Column(precision = 15, scale = 4)
    private BigDecimal unitsOrShares;

    @Column(precision = 15, scale = 2)
    private BigDecimal buyPriceAvg;

    @Column(precision = 15, scale = 2)
    private BigDecimal currentNavOrPrice;

    @Column(nullable = false)
    private LocalDate investmentDate;

    private Integer sipDayOfMonth;
    private String notes;

    public enum AssetType {
        MUTUAL_FUND, SIP, STOCKS, GOLD, FIXED_DEPOSIT, PPF, OTHER
    }
}
