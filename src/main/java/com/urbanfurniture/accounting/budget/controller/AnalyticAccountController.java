package com.urbanfurniture.accounting.budget.controller;

import com.urbanfurniture.accounting.budget.dto.AnalyticAccountResponse;
import com.urbanfurniture.accounting.budget.dto.CreateAnalyticAccountRequest;
import com.urbanfurniture.accounting.budget.dto.UpdateAnalyticAccountRequest;
import com.urbanfurniture.accounting.budget.service.AnalyticAccountService;
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
@RequestMapping("/api/analytic-accounts")
@RequiredArgsConstructor
public class AnalyticAccountController {

    private final AnalyticAccountService analyticAccountService;

    @PostMapping
    public ResponseEntity<AnalyticAccountResponse> create(
            @Valid @RequestBody CreateAnalyticAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(analyticAccountService.create(request));
    }

    @GetMapping
    public List<AnalyticAccountResponse> findAll() {
        return analyticAccountService.findAll();
    }

    @GetMapping("/{id}")
    public AnalyticAccountResponse findById(@PathVariable @Positive Long id) {
        return analyticAccountService.findById(id);
    }

    @PutMapping("/{id}")
    public AnalyticAccountResponse update(@PathVariable @Positive Long id,
                                          @Valid @RequestBody UpdateAnalyticAccountRequest request) {
        return analyticAccountService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public AnalyticAccountResponse deactivate(@PathVariable @Positive Long id) {
        return analyticAccountService.deactivate(id);
    }
}
