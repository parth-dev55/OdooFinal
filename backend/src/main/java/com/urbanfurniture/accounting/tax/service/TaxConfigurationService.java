package com.urbanfurniture.accounting.tax.service;

import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.enums.AccountType;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.tax.dto.CreateTaxConfigurationRequest;
import com.urbanfurniture.accounting.tax.dto.TaxConfigurationResponse;
import com.urbanfurniture.accounting.tax.dto.UpdateTaxConfigurationRequest;
import com.urbanfurniture.accounting.tax.entity.TaxConfiguration;
import com.urbanfurniture.accounting.tax.enums.TaxType;
import com.urbanfurniture.accounting.tax.repository.TaxConfigurationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class TaxConfigurationService {

    private final TaxConfigurationRepository taxConfigurations;
    private final AccountRepository accounts;

    @Transactional
    public TaxConfigurationResponse create(CreateTaxConfigurationRequest request) {
        String name = requiredName(request.name());
        validateRateAndType(request.rate(), request.type());
        if (taxConfigurations.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Tax configuration name is already in use");
        }
        TaxConfiguration tax = new TaxConfiguration();
        tax.setName(name);
        tax.setRate(request.rate());
        tax.setType(request.type());
        tax.setTaxAccount(resolveAccount(request.taxAccountId(), request.type()));
        tax.setActive(request.active() == null || request.active());
        return toResponse(taxConfigurations.save(tax));
    }

    @Transactional(readOnly = true)
    public List<TaxConfigurationResponse> findAll() {
        return taxConfigurations.findAllByOrderByIdAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TaxConfigurationResponse findById(Long id) {
        return toResponse(findTax(id));
    }

    @Transactional
    public TaxConfigurationResponse update(Long id, UpdateTaxConfigurationRequest request) {
        TaxConfiguration tax = findTax(id);
        if (request.name() != null) {
            String name = requiredName(request.name());
            if (!name.equalsIgnoreCase(tax.getName())
                    && taxConfigurations.existsByNameIgnoreCaseAndIdNot(name, id)) {
                throw new DuplicateResourceException("Tax configuration name is already in use");
            }
            tax.setName(name);
        }
        if (request.rate() != null) tax.setRate(request.rate());
        if (request.type() != null) tax.setType(request.type());
        if (request.taxAccountId() != null) {
            tax.setTaxAccount(resolveAccount(request.taxAccountId(), tax.getType()));
        }
        validateRateAndType(tax.getRate(), tax.getType());
        if (request.active() != null) tax.setActive(request.active());
        return toResponse(taxConfigurations.save(tax));
    }

    @Transactional
    public TaxConfigurationResponse deactivate(Long id) {
        TaxConfiguration tax = findTax(id);
        tax.setActive(false);
        return toResponse(taxConfigurations.save(tax));
    }

    @Transactional(readOnly = true)
    public TaxConfiguration resolveActive(Long id, TaxType expectedType) {
        if (id == null) {
            return null;
        }
        TaxConfiguration tax = taxConfigurations.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax configuration " + id + " was not found"));
        if (!tax.isActive()) {
            throw new AccountingValidationException("Tax configuration " + id + " is inactive");
        }
        if (tax.getType() != expectedType) {
            throw new AccountingValidationException("Tax configuration " + id + " is not a " + expectedType.name());
        }
        return tax;
    }

    public Account requireTaxAccount(TaxConfiguration tax) {
        if (tax == null || tax.getTaxAccount() == null) {
            throw new AccountingValidationException("An active tax configuration must have a tax account");
        }
        Account account = tax.getTaxAccount();
        if (!account.isActive()) {
            throw new AccountingValidationException("Tax account " + account.getId() + " is inactive");
        }
        AccountType expected = tax.getType() == TaxType.SALES_TAX
                ? AccountType.LIABILITY : AccountType.ASSET;
        if (account.getType() != null && account.getType() != expected) {
            throw new AccountingValidationException("Tax account " + account.getId()
                    + " must be a " + expected + " account");
        }
        return account;
    }

    private TaxConfiguration findTax(Long id) {
        return taxConfigurations.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax configuration " + id + " was not found"));
    }

    private String requiredName(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new AccountingValidationException("Tax configuration name is required");
        }
        return value.trim();
    }

    private Account resolveAccount(Long id, TaxType type) {
        if (id == null) {
            return null;
        }
        Account account = accounts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account " + id + " was not found"));
        if (!account.isActive()) {
            throw new AccountingValidationException("Account " + id + " is inactive");
        }
        AccountType expected = type == TaxType.SALES_TAX ? AccountType.LIABILITY : AccountType.ASSET;
        if (account.getType() != null && account.getType() != expected) {
            throw new AccountingValidationException("Tax account " + id + " must be a " + expected + " account");
        }
        return account;
    }

    private void validateRateAndType(BigDecimal rate, TaxType type) {
        if (rate == null || rate.compareTo(BigDecimal.ZERO) < 0
                || rate.compareTo(new BigDecimal("100.00")) > 0) {
            throw new AccountingValidationException("Tax rate must be between 0 and 100");
        }
        if (type == null) {
            throw new AccountingValidationException("Tax type is required");
        }
    }

    private TaxConfigurationResponse toResponse(TaxConfiguration tax) {
        Account account = tax.getTaxAccount();
        return new TaxConfigurationResponse(tax.getId(), tax.getName(), tax.getRate(), tax.getType(),
                account == null ? null : account.getId(),
                account == null ? null : account.getCode(),
                tax.isActive(), tax.getCreatedAt(), tax.getUpdatedAt());
    }
}
