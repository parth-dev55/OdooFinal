package com.urbanfurniture.accounting.payment.dto;

import com.urbanfurniture.accounting.payment.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RegisterPaymentRequest(
        @NotNull LocalDate paymentDate,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 17, fraction = 2) BigDecimal amount,
        @NotNull PaymentMethod paymentMethod,
        @Size(max = 100) String reference,
        @NotNull @Positive Long journalId,
        @NotNull @Positive Long counterpartyAccountId,
        @NotNull @Positive Long cashOrBankAccountId
) {
}
