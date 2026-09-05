package com.urbanfurniture.accounting.budget.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BudgetCalculationTest {

    @Test
    void calculatesVarianceAndPercentage() {
        assertEquals(0, new BigDecimal("7250.00").compareTo(
                BudgetCalculation.variance(new BigDecimal("10000"), new BigDecimal("2750"))));
        assertEquals(new BigDecimal("72.50"),
                BudgetCalculation.variancePercentage(new BigDecimal("10000"), new BigDecimal("2750")));
    }

    @Test
    void avoidsDivisionByZero() {
        assertEquals(new BigDecimal("0.00"),
                BudgetCalculation.variancePercentage(BigDecimal.ZERO, BigDecimal.ZERO));
    }
}
