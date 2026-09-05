package com.urbanfurniture.accounting.budget.repository;

import com.urbanfurniture.accounting.budget.entity.AnalyticAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalyticAccountRepository extends JpaRepository<AnalyticAccount, Long> {
    boolean existsByCodeIgnoreCase(String code);
}
