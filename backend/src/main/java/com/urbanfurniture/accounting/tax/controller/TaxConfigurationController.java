package com.urbanfurniture.accounting.tax.controller;

import com.urbanfurniture.accounting.tax.dto.CreateTaxConfigurationRequest;
import com.urbanfurniture.accounting.tax.dto.TaxConfigurationResponse;
import com.urbanfurniture.accounting.tax.dto.UpdateTaxConfigurationRequest;
import com.urbanfurniture.accounting.tax.service.TaxConfigurationService;
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
@RequestMapping("/api/tax-configurations")
public class TaxConfigurationController {

    private final TaxConfigurationService taxConfigurations;

    @PostMapping
    public ResponseEntity<TaxConfigurationResponse> create(
            @Valid @RequestBody CreateTaxConfigurationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taxConfigurations.create(request));
    }

    @GetMapping
    public List<TaxConfigurationResponse> findAll() {
        return taxConfigurations.findAll();
    }

    @GetMapping("/{id}")
    public TaxConfigurationResponse findById(@PathVariable @Positive Long id) {
        return taxConfigurations.findById(id);
    }

    @PutMapping("/{id}")
    public TaxConfigurationResponse update(@PathVariable @Positive Long id,
                                           @Valid @RequestBody UpdateTaxConfigurationRequest request) {
        return taxConfigurations.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public TaxConfigurationResponse deactivate(@PathVariable @Positive Long id) {
        return taxConfigurations.deactivate(id);
    }
}
