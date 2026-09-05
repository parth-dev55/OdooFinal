package com.urbanfurniture.accounting.budget.repository;

import com.urbanfurniture.accounting.budget.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
}
