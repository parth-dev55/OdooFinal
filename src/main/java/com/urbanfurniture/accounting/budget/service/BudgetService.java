package com.urbanfurniture.accounting.budget.service;

import com.urbanfurniture.accounting.budget.dto.BudgetResponse;
import com.urbanfurniture.accounting.budget.dto.CreateBudgetRequest;
import com.urbanfurniture.accounting.budget.dto.UpdateBudgetRequest;
import com.urbanfurniture.accounting.budget.entity.AnalyticAccount;
import com.urbanfurniture.accounting.budget.entity.Budget;
import com.urbanfurniture.accounting.budget.repository.AnalyticAccountRepository;
import com.urbanfurniture.accounting.budget.repository.BudgetRepository;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final AnalyticAccountRepository analyticAccountRepository;

    @Transactional
    public BudgetResponse create(CreateBudgetRequest request) {
        validateDateRange(request.periodStart(), request.periodEnd());
        Budget budget = new Budget();
        budget.setName(request.name().trim());
        budget.setPeriodStart(request.periodStart());
        budget.setPeriodEnd(request.periodEnd());
        budget.setPlannedAmount(request.plannedAmount());
        budget.setResponsiblePerson(request.responsiblePerson().trim());
        budget.setAnalyticAccount(findActiveAccount(request.analyticAccountId()));
        budget.setActive(request.active() == null || request.active());
        return BudgetResponse.from(budgetRepository.save(budget));
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> findAll() {
        return budgetRepository.findAll().stream().map(BudgetResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BudgetResponse findById(Long id) {
        return BudgetResponse.from(findBudget(id));
    }

    @Transactional
    public BudgetResponse update(Long id, UpdateBudgetRequest request) {
        Budget budget = findBudget(id);
        LocalDate periodStart = request.periodStart() == null ? budget.getPeriodStart() : request.periodStart();
        LocalDate periodEnd = request.periodEnd() == null ? budget.getPeriodEnd() : request.periodEnd();
        validateDateRange(periodStart, periodEnd);
        if (request.name() != null) budget.setName(request.name().trim());
        if (request.periodStart() != null) budget.setPeriodStart(request.periodStart());
        if (request.periodEnd() != null) budget.setPeriodEnd(request.periodEnd());
        if (request.plannedAmount() != null) budget.setPlannedAmount(request.plannedAmount());
        if (request.responsiblePerson() != null) budget.setResponsiblePerson(request.responsiblePerson().trim());
        if (request.analyticAccountId() != null) {
            budget.setAnalyticAccount(findActiveAccount(request.analyticAccountId()));
        }
        if (request.active() != null) budget.setActive(request.active());
        return BudgetResponse.from(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse deactivate(Long id) {
        Budget budget = findBudget(id);
        budget.setActive(false);
        return BudgetResponse.from(budgetRepository.save(budget));
    }

    private Budget findBudget(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget " + id + " was not found"));
    }

    private AnalyticAccount findActiveAccount(Long id) {
        AnalyticAccount account = analyticAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Analytic account " + id + " was not found"));
        if (!account.isActive()) {
            throw new AccountingValidationException("Analytic account " + id + " is inactive");
        }
        return account;
    }

    private void validateDateRange(LocalDate periodStart, LocalDate periodEnd) {
        if (periodStart.isAfter(periodEnd)) {
            throw new AccountingValidationException("Budget period start must be on or before period end");
        }
    }
}
