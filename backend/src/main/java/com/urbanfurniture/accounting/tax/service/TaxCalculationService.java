package com.urbanfurniture.accounting.tax.service;

import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.tax.entity.TaxConfiguration;
import com.urbanfurniture.accounting.tax.enums.TaxType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class TaxCalculationService {

    private static final int MONEY_SCALE = 2;

    private final TaxConfigurationService taxConfigurations;

    public TaxCalculation calculate(Product product, TaxType type,
                                    BigDecimal quantity, BigDecimal unitPrice) {
        BigDecimal subtotal = quantity.multiply(unitPrice).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        Long taxId = type == TaxType.SALES_TAX
                ? product.getSalesTaxId()
                : product.getPurchaseTaxId();
        TaxConfiguration tax = taxConfigurations.resolveActive(taxId, type);
        BigDecimal taxAmount = tax == null
                ? BigDecimal.ZERO.setScale(MONEY_SCALE)
                : subtotal.multiply(tax.getRate())
                .divide(BigDecimal.valueOf(100), MONEY_SCALE, RoundingMode.HALF_UP);
        return new TaxCalculation(subtotal, taxAmount, subtotal.add(taxAmount));
    }

    public record TaxCalculation(BigDecimal subtotal, BigDecimal taxAmount, BigDecimal total) {
    }
}
