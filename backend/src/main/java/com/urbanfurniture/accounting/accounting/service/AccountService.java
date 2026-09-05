package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.AccountResponse;
import com.urbanfurniture.accounting.accounting.dto.CreateAccountRequest;
import com.urbanfurniture.accounting.accounting.dto.UpdateAccountRequest;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional
    public AccountResponse create(CreateAccountRequest request) {
        String code = normalizeCode(request.code());
        if (accountRepository.existsByCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Account code is already in use");
        }

        Account account = new Account();
        account.setCode(code);
        account.setName(requiredText(request.name(), "Account name"));
        account.setType(request.type());
        account.setActive(request.active() == null || request.active());
        return toResponse(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> findAll() {
        return accountRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse findById(Long id) {
        return toResponse(findAccount(id));
    }

    @Transactional
    public AccountResponse update(Long id, UpdateAccountRequest request) {
        Account account = findAccount(id);

        if (request.code() != null) {
            String code = normalizeCode(request.code());
            if (!code.equalsIgnoreCase(account.getCode())
                    && accountRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
                throw new DuplicateResourceException("Account code is already in use");
            }
            account.setCode(code);
        }
        if (request.name() != null) {
            account.setName(requiredText(request.name(), "Account name"));
        }
        if (request.type() != null) {
            account.setType(request.type());
        }
        if (request.active() != null) {
            account.setActive(request.active());
        }
        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse archive(Long id) {
        Account account = findAccount(id);
        account.setActive(false);
        return toResponse(accountRepository.save(account));
    }

    private Account findAccount(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account " + id + " was not found"));
    }

    private String requiredText(String value, String field) {
        if (value == null || value.trim().isEmpty()) {
            throw new AccountingValidationException(field + " is required");
        }
        return value.trim();
    }

    private String normalizeCode(String value) {
        return requiredText(value, "Account code").toUpperCase(Locale.ROOT);
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(account.getId(), account.getCode(), account.getName(),
                account.getType(), account.isActive());
    }
}
