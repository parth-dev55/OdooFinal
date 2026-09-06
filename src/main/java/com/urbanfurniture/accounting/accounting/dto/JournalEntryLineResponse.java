package com.urbanfurniture.accounting.accounting.dto;

import java.math.BigDecimal;

public record JournalEntryLineResponse(Long id, Long accountId, String accountCode, String accountName,
                                       BigDecimal debit, BigDecimal credit, String description) {
}
