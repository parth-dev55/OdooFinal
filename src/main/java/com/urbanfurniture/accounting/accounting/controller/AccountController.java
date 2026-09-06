package com.urbanfurniture.accounting.accounting.controller;

import com.urbanfurniture.accounting.accounting.dto.AccountRequest;
import com.urbanfurniture.accounting.accounting.dto.AccountResponse;
import com.urbanfurniture.accounting.accounting.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody AccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(request));
    }

    @GetMapping
    public List<AccountResponse> findAll() {
        return accountService.findAll();
    }
}
