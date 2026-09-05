package com.urbanfurniture.accounting.tax.service;

import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.tax.entity.TaxConfiguration;
import com.urbanfurniture.accounting.tax.enums.TaxType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TaxCalculationServiceTest {

    @Test
    void calculatesTaxUsingServerSideConfiguration() {
        Product product = new Product();
        TaxConfiguration tax = new TaxConfiguration();
        tax.setId(1L);
        tax.setRate(new BigDecimal("18.00"));

        TaxConfigurationService configurations = mock(TaxConfigurationService.class);
        when(configurations.resolveActive(1L, TaxType.SALES_TAX)).thenReturn(tax);
        product.setSalesTax(tax);

        var result = new TaxCalculationService(configurations)
                .calculate(product, TaxType.SALES_TAX, new BigDecimal("5"), new BigDecimal("1000"));

        assertEquals(new BigDecimal("5000.00"), result.subtotal());
        assertEquals(new BigDecimal("900.00"), result.taxAmount());
        assertEquals(new BigDecimal("5900.00"), result.total());
    }

    @Test
    void roundsDecimalTaxHalfUp() {
        Product product = new Product();
        TaxConfiguration tax = new TaxConfiguration();
        tax.setId(2L);
        tax.setRate(new BigDecimal("5.00"));

        TaxConfigurationService configurations = mock(TaxConfigurationService.class);
        when(configurations.resolveActive(2L, TaxType.PURCHASE_TAX)).thenReturn(tax);
        product.setPurchaseTax(tax);

        var result = new TaxCalculationService(configurations)
                .calculate(product, TaxType.PURCHASE_TAX, new BigDecimal("3"), new BigDecimal("0.99"));

        assertEquals(new BigDecimal("2.97"), result.subtotal());
        assertEquals(new BigDecimal("0.15"), result.taxAmount());
        assertEquals(new BigDecimal("3.12"), result.total());
    }

    @Test
    void missingTaxConfigurationProducesZeroTax() {
        Product product = new Product();
        TaxConfigurationService configurations = mock(TaxConfigurationService.class);
        when(configurations.resolveActive(null, TaxType.SALES_TAX)).thenReturn(null);

        var result = new TaxCalculationService(configurations)
                .calculate(product, TaxType.SALES_TAX, new BigDecimal("2"), new BigDecimal("100"));

        assertEquals(new BigDecimal("0.00"), result.taxAmount());
        assertEquals(new BigDecimal("200.00"), result.total());
    }

    @Test
    void supportsRequiredCommonRates() {
        Product product = new Product();
        TaxConfiguration tax = new TaxConfiguration();
        tax.setId(3L);
        TaxConfigurationService configurations = mock(TaxConfigurationService.class);
        TaxCalculationService calculator = new TaxCalculationService(configurations);

        for (String rate : new String[]{"5.00", "12.00", "18.00", "28.00"}) {
            tax.setRate(new BigDecimal(rate));
            when(configurations.resolveActive(3L, TaxType.SALES_TAX)).thenReturn(tax);
            product.setSalesTax(tax);
            var result = calculator.calculate(product, TaxType.SALES_TAX,
                    new BigDecimal("100"), new BigDecimal("1.00"));
            assertEquals(new BigDecimal(rate), result.taxAmount());
        }
    }
}
