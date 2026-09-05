package com.urbanfurniture.accounting.accounting.controller;

import com.urbanfurniture.accounting.accounting.dto.LedgerResponse;
import com.urbanfurniture.accounting.accounting.service.LedgerService;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/ledger")
public class LedgerController {

    private final LedgerService ledgerService;

    @GetMapping("/accounts/{accountId}")
    public LedgerResponse accountLedger(@PathVariable @Positive Long accountId,
                                        @RequestParam @NotNull LocalDate startDate,
                                        @RequestParam @NotNull LocalDate endDate) {
        return ledgerService.findAccountLedger(accountId, startDate, endDate);
    }
}
