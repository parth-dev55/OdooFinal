package com.urbanfurniture.accounting.budget.controller;

import com.urbanfurniture.accounting.budget.dto.*;
import com.urbanfurniture.accounting.budget.service.BudgetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService budgetService;

    @PostMapping("/analytic-accounts")
    public ResponseEntity<AnalyticAccountResponse> createAnalyticAccount(
            @Valid @RequestBody CreateAnalyticAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.createAnalyticAccount(request));
    }

    @GetMapping("/analytic-accounts")
    public List<AnalyticAccountResponse> findAnalyticAccounts() {
        return budgetService.findAnalyticAccounts();
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(@Valid @RequestBody CreateBudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.create(request));
    }

    @GetMapping
    public List<BudgetResponse> findAll() {
        return budgetService.findAll();
    }

    @GetMapping("/{id}")
    public BudgetResponse findById(@PathVariable @Positive Long id) {
        return budgetService.findById(id);
    }

    @PutMapping("/{id}")
    public BudgetResponse update(@PathVariable @Positive Long id,
                                 @Valid @RequestBody UpdateBudgetRequest request) {
        return budgetService.update(id, request);
    }

    @PostMapping("/{id}/close")
    public BudgetResponse close(@PathVariable @Positive Long id) {
        return budgetService.close(id);
    }
}
