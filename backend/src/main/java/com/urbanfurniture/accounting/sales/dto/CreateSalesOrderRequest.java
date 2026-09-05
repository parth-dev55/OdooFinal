package com.urbanfurniture.accounting.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.util.List;

public record CreateSalesOrderRequest(@NotNull @Positive Long customerId, @NotNull LocalDate orderDate,
                                      @NotNull @Positive Long createdById,
                                      @NotEmpty List<@Valid SalesLineRequest> items) { }
