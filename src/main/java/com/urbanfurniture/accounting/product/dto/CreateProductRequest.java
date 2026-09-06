package com.urbanfurniture.accounting.product.dto;

import com.urbanfurniture.accounting.product.enums.ProductType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull ProductType type,
        @NotNull @DecimalMin(value = "0.0") @Digits(integer = 17, fraction = 2) BigDecimal salesPrice,
        @NotNull @DecimalMin(value = "0.0") @Digits(integer = 17, fraction = 2) BigDecimal purchasePrice,
        @NotBlank @Size(max = 100) String category,
        Boolean active
) {
}
