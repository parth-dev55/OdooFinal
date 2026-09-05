package com.urbanfurniture.accounting.product.dto;

import com.urbanfurniture.accounting.product.enums.ProductType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProductRequest(
        @Size(max = 150) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String name,
        ProductType type,
        @DecimalMin(value = "0.0") @Digits(integer = 17, fraction = 2) BigDecimal salesPrice,
        @DecimalMin(value = "0.0") @Digits(integer = 17, fraction = 2) BigDecimal purchasePrice,
        @Size(max = 100) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String category,
        Boolean active
) {
}
