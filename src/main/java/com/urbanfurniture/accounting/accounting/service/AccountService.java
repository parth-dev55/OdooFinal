package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.AccountRequest;
import com.urbanfurniture.accounting.accounting.dto.AccountResponse;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;

    @Transactional
    public AccountResponse create(AccountRequest request) {
        Account account = new Account();
        account.setCode(request.code().trim());
        account.setName(request.name().trim());
        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> findAll() {
        return accountRepository.findAll().stream().map(AccountResponse::from).toList();
    }
}
