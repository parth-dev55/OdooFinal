package com.urbanfurniture.accounting.accounting.dto;

import java.math.BigDecimal;

public record DocumentPostingResponse(Long documentId, Long journalEntryId, BigDecimal amount) {
}
