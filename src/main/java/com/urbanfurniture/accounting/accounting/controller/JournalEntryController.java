package com.urbanfurniture.accounting.accounting.controller;

import com.urbanfurniture.accounting.accounting.dto.CreateJournalEntryRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryResponse;
import com.urbanfurniture.accounting.accounting.service.AccountingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/journal-entries")
@RequiredArgsConstructor
public class JournalEntryController {
    private final AccountingService accountingService;

    @PostMapping
    public ResponseEntity<JournalEntryResponse> create(@Valid @RequestBody CreateJournalEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountingService.create(request));
    }

    @GetMapping
    public List<JournalEntryResponse> findAll() { return accountingService.findAll(); }

    @GetMapping("/{id}")
    public JournalEntryResponse findById(@PathVariable @Positive Long id) { return accountingService.findById(id); }
}
