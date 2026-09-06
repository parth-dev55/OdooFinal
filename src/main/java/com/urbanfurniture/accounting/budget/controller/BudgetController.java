package com.urbanfurniture.accounting.budget.controller;

import com.urbanfurniture.accounting.budget.dto.BudgetResponse;
import com.urbanfurniture.accounting.budget.dto.BudgetSummaryResponse;
import com.urbanfurniture.accounting.budget.dto.CreateBudgetRequest;
import com.urbanfurniture.accounting.budget.dto.UpdateBudgetRequest;
import com.urbanfurniture.accounting.budget.service.BudgetService;
import com.urbanfurniture.accounting.report.service.BudgetReportService;
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
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetReportService budgetReportService;

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

    @PatchMapping("/{id}/deactivate")
    public BudgetResponse deactivate(@PathVariable @Positive Long id) {
        return budgetService.deactivate(id);
    }

    @GetMapping("/{id}/summary")
    public BudgetSummaryResponse summary(@PathVariable @Positive Long id) {
        return budgetReportService.summarize(id);
    }
}
