package com.urbanfurniture.accounting.sales.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record CreateInvoiceRequest(@NotNull LocalDate invoiceDate, @NotNull LocalDate dueDate,
                                   @Positive Long journalId) { }
