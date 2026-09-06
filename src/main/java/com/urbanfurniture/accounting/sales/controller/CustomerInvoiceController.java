package com.urbanfurniture.accounting.sales.controller;

import com.urbanfurniture.accounting.accounting.dto.DocumentPostingResponse;
import com.urbanfurniture.accounting.accounting.dto.PostDocumentRequest;
import com.urbanfurniture.accounting.accounting.service.DocumentPostingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer-invoices")
@RequiredArgsConstructor
public class CustomerInvoiceController {
    private final DocumentPostingService documentPostingService;

    @PostMapping("/{id}/post")
    public DocumentPostingResponse post(@PathVariable @Positive Long id,
                                        @Valid @RequestBody PostDocumentRequest request) {
        return documentPostingService.postCustomerInvoice(id, request);
    }
}
