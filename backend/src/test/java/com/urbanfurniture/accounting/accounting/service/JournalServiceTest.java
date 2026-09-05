package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.CreateJournalRequest;
import com.urbanfurniture.accounting.accounting.dto.UpdateJournalRequest;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.enums.AccountType;
import com.urbanfurniture.accounting.accounting.enums.JournalType;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
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
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JournalServiceTest {

    @Mock
    private JournalRepository journalRepository;

    @Mock
    private AccountRepository accountRepository;

    private JournalService journalService;

    @BeforeEach
    void setUp() {
        journalService = new JournalService(journalRepository, accountRepository);
        lenient().when(journalRepository.save(any(Journal.class))).thenAnswer(invocation -> {
            Journal journal = invocation.getArgument(0);
            journal.setId(1L);
            return journal;
        });
    }

    @Test
    void createsJournalWithDefaultAccounts() {
        Account cash = account(10L, "1000", true);
        Account sales = account(20L, "4000", true);
        when(accountRepository.findById(10L)).thenReturn(Optional.of(cash));
        when(accountRepository.findById(20L)).thenReturn(Optional.of(sales));

        var response = journalService.create(new CreateJournalRequest(
                "  Sales Journal ", JournalType.SALES, 10L, 20L, null));

        assertEquals("Sales Journal", response.name());
        assertEquals(JournalType.SALES, response.type());
        assertEquals(10L, response.defaultDebitAccountId());
        assertEquals("4000", response.defaultCreditAccountCode());
        assertEquals(true, response.active());
    }

    @Test
    void rejectsDuplicateJournalName() {
        when(journalRepository.existsByNameIgnoreCase("Sales Journal")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> journalService.create(
                new CreateJournalRequest("Sales Journal", JournalType.SALES, null, null, null)));
    }

    @Test
    void rejectsInactiveDefaultAccount() {
        when(accountRepository.findById(10L)).thenReturn(Optional.of(account(10L, "1000", false)));

        assertThrows(AccountingValidationException.class, () -> journalService.create(
                new CreateJournalRequest("Cash Journal", JournalType.CASH, 10L, null, null)));
    }

    @Test
    void updatesAndArchivesJournal() {
        Journal journal = new Journal();
        journal.setId(1L);
        journal.setName("General");
        journal.setType(JournalType.GENERAL);
        journal.setActive(true);
        when(journalRepository.findById(1L)).thenReturn(Optional.of(journal));
        when(journalRepository.existsByNameIgnoreCaseAndIdNot("Bank Journal", 1L)).thenReturn(false);

        var updated = journalService.update(1L,
                new UpdateJournalRequest("Bank Journal", JournalType.BANK, null, null, null));
        assertEquals("Bank Journal", updated.name());
        assertEquals(JournalType.BANK, updated.type());

        var archived = journalService.archive(1L);
        assertFalse(archived.active());
    }

    private Account account(Long id, String code, boolean active) {
        Account account = new Account();
        account.setId(id);
        account.setCode(code);
        account.setName(code);
        account.setType(AccountType.ASSET);
        account.setActive(active);
        return account;
    }
}
