package com.urbanfurniture.accounting.accounting.repository;

import com.urbanfurniture.accounting.accounting.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
}
