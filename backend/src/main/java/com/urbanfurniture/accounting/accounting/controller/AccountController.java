package com.urbanfurniture.accounting.accounting.controller;

import com.urbanfurniture.accounting.accounting.dto.AccountResponse;
import com.urbanfurniture.accounting.accounting.dto.CreateAccountRequest;
import com.urbanfurniture.accounting.accounting.dto.UpdateAccountRequest;
import com.urbanfurniture.accounting.accounting.service.AccountService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(request));
    }

    @GetMapping
    public List<AccountResponse> findAll() {
        return accountService.findAll();
    }

    @GetMapping("/{id}")
    public AccountResponse findById(@PathVariable @Positive Long id) {
        return accountService.findById(id);
    }

    @PutMapping("/{id}")
    public AccountResponse update(@PathVariable @Positive Long id,
                                  @Valid @RequestBody UpdateAccountRequest request) {
        return accountService.update(id, request);
    }

    @PatchMapping("/{id}/archive")
    public AccountResponse archive(@PathVariable @Positive Long id) {
        return accountService.archive(id);
    }
}
