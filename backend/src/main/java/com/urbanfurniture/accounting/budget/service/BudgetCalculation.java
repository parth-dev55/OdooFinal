package com.urbanfurniture.accounting.budget.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class BudgetCalculation {

    private BudgetCalculation() {
    }

    public static BigDecimal variance(BigDecimal plannedAmount, BigDecimal actualAmount) {
        return plannedAmount.subtract(actualAmount);
    }

    public static BigDecimal variancePercentage(BigDecimal plannedAmount, BigDecimal actualAmount) {
        if (plannedAmount.signum() == 0) {
            return BigDecimal.ZERO.setScale(2);
        }
        return variance(plannedAmount, actualAmount)
                .divide(plannedAmount, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
