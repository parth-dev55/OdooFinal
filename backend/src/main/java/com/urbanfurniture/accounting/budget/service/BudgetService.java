package com.urbanfurniture.accounting.budget.service;

import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.budget.dto.*;
import com.urbanfurniture.accounting.budget.entity.AnalyticAccount;
import com.urbanfurniture.accounting.budget.entity.Budget;
import com.urbanfurniture.accounting.budget.repository.AnalyticAccountRepository;
import com.urbanfurniture.accounting.budget.repository.BudgetRepository;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetRepository budgets;
    private final AnalyticAccountRepository analyticAccounts;
    private final BudgetActualService budgetActuals;

    @Transactional
    public AnalyticAccountResponse createAnalyticAccount(CreateAnalyticAccountRequest request) {
        String code = request.code().trim().toUpperCase(Locale.ROOT);
        if (analyticAccounts.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Analytic account code is already in use");
        }
        AnalyticAccount account = new AnalyticAccount();
        account.setCode(code);
        account.setName(request.name().trim());
        return accountResponse(analyticAccounts.save(account));
    }

    @Transactional(readOnly = true)
    public List<AnalyticAccountResponse> findAnalyticAccounts() {
        return analyticAccounts.findAll().stream().map(this::accountResponse).toList();
    }

    @Transactional
    public BudgetResponse create(CreateBudgetRequest request) {
        validateDates(request.startDate(), request.endDate());
        Budget budget = new Budget();
        budget.setName(request.name().trim());
        budget.setAnalyticAccount(account(request.analyticAccountId()));
        budget.setStartDate(request.startDate());
        budget.setEndDate(request.endDate());
        budget.setPlannedAmount(request.plannedAmount());
        return response(budgets.save(budget));
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> findAll() {
        return budgets.findAll().stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public BudgetResponse findById(Long id) {
        return response(budget(id));
    }

    @Transactional
    public BudgetResponse update(Long id, UpdateBudgetRequest request) {
        Budget budget = budget(id);
        LocalDatePair dates = new LocalDatePair(
                request.startDate() == null ? budget.getStartDate() : request.startDate(),
                request.endDate() == null ? budget.getEndDate() : request.endDate());
        validateDates(dates.startDate(), dates.endDate());
        if (request.name() != null) budget.setName(request.name().trim());
        budget.setStartDate(dates.startDate());
        budget.setEndDate(dates.endDate());
        if (request.plannedAmount() != null) budget.setPlannedAmount(request.plannedAmount());
        if (request.actualAmount() != null) budget.setActualAmount(request.actualAmount());
        if (request.status() != null) budget.setStatus(request.status());
        return response(budgets.save(budget));
    }

    @Transactional
    public BudgetResponse close(Long id) {
        Budget budget = budget(id);
        budget.setStatus(com.urbanfurniture.accounting.budget.enums.BudgetStatus.CLOSED);
        return response(budgets.save(budget));
    }

    private AnalyticAccount account(Long id) {
        AnalyticAccount account = analyticAccounts.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Analytic account " + id + " was not found"));
        if (!account.isActive()) {
            throw new AccountingValidationException("Analytic account " + id + " is inactive");
        }
        return account;
    }

    private Budget budget(Long id) {
        return budgets.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget " + id + " was not found"));
    }

    private void validateDates(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new AccountingValidationException("Budget end date cannot be before start date");
        }
    }

    private AnalyticAccountResponse accountResponse(AnalyticAccount account) {
        return new AnalyticAccountResponse(account.getId(), account.getCode(), account.getName(), account.isActive());
    }

    private BudgetResponse response(Budget budget) {
        BigDecimal actual = budgetActuals.actualFor(budget);
        BigDecimal remaining = budget.getPlannedAmount().subtract(actual);
        BigDecimal variance = BudgetCalculation.variance(budget.getPlannedAmount(), actual);
        BigDecimal variancePercentage = BudgetCalculation.variancePercentage(
                budget.getPlannedAmount(), actual);
        AnalyticAccount account = budget.getAnalyticAccount();
        return new BudgetResponse(budget.getId(), budget.getName(), account.getId(), account.getCode(),
                account.getName(), budget.getStartDate(), budget.getEndDate(), budget.getPlannedAmount(),
                actual, remaining, variance, variancePercentage, budget.getStatus(),
                budget.getCreatedAt(), budget.getUpdatedAt());
    }

    private record LocalDatePair(java.time.LocalDate startDate, java.time.LocalDate endDate) {
    }
}
