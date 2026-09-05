package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.CreateAccountRequest;
import com.urbanfurniture.accounting.accounting.dto.UpdateAccountRequest;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.enums.AccountType;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private com.urbanfurniture.accounting.accounting.repository.AccountRepository accountRepository;

    private AccountService accountService;

    @BeforeEach
    void setUp() {
        accountService = new AccountService(accountRepository);
        lenient().when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> {
            Account account = invocation.getArgument(0);
            account.setId(1L);
            return account;
        });
    }

    @Test
    void createsAccountWithNormalizedCode() {
        var response = accountService.create(new CreateAccountRequest(
                "  cash-1000 ", "Cash", AccountType.ASSET, null));

        assertEquals("CASH-1000", response.code());
        assertEquals(AccountType.ASSET, response.type());
        assertEquals("Cash", response.name());
        assertEquals(true, response.active());
    }

    @Test
    void rejectsDuplicateCode() {
        when(accountRepository.existsByCodeIgnoreCase("CASH-1000")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> accountService.create(
                new CreateAccountRequest("cash-1000", "Cash", AccountType.ASSET, null)));
    }

    @Test
    void updatesAccountAndArchivesIt() {
        Account account = account(1L, "1000", "Cash", AccountType.ASSET, true);
        when(accountRepository.findById(1L)).thenReturn(Optional.of(account));
        when(accountRepository.existsByCodeIgnoreCaseAndIdNot("BANK-1000", 1L)).thenReturn(false);

        var updated = accountService.update(1L,
                new UpdateAccountRequest("bank-1000", "Bank", AccountType.ASSET, null));
        assertEquals("BANK-1000", updated.code());
        assertEquals("Bank", updated.name());

        var archived = accountService.archive(1L);
        assertFalse(archived.active());
        verify(accountRepository, org.mockito.Mockito.times(2)).save(account);
    }

    @Test
    void rejectsMissingAccount() {
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> accountService.findById(99L));
    }

    private Account account(Long id, String code, String name, AccountType type, boolean active) {
        Account account = new Account();
        account.setId(id);
        account.setCode(code);
        account.setName(name);
        account.setType(type);
        account.setActive(active);
        return account;
    }
}
