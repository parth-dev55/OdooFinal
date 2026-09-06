package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountingServiceTest {

    @Mock private JournalRepository journalRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private JournalEntryRepository journalEntryRepository;

    private AccountingService accountingService;

    @BeforeEach
    void setUp() {
        accountingService = new AccountingService(journalRepository, accountRepository, journalEntryRepository);
        Journal journal = new Journal();
        journal.setName("General");
        when(journalRepository.findById(1L)).thenReturn(Optional.of(journal));

        Account account = new Account();
        account.setCode("1000");
        account.setName("Cash");
        lenient().when(accountRepository.findById(any())).thenReturn(Optional.of(account));
        lenient().when(journalEntryRepository.save(any(JournalEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createsValidBalancedEntry() {
        accountingService.createJournalEntry(1L, LocalDate.now(), "OPEN-1", "Opening balance", JournalEntryStatus.POSTED,
                List.of(line(10L, "100.00", "0"), line(20L, "0", "100.00")));

        ArgumentCaptor<JournalEntry> captor = ArgumentCaptor.forClass(JournalEntry.class);
        verify(journalEntryRepository).save(captor.capture());
        assertEquals(2, captor.getValue().getLines().size());
        assertEquals(JournalEntryStatus.POSTED, captor.getValue().getStatus());
    }

    @Test
    void rejectsUnbalancedEntry() {
        assertThrows(AccountingValidationException.class, () -> accountingService.createJournalEntry(1L, LocalDate.now(), null,
                null, null, List.of(line(10L, "100", "0"), line(20L, "0", "99"))));
        verify(journalEntryRepository, never()).save(any());
    }

    @Test
    void rejectsNegativeAmount() {
        assertThrows(AccountingValidationException.class, () -> accountingService.createJournalEntry(1L, LocalDate.now(), null,
                null, null, List.of(line(10L, "-1", "0"), line(20L, "0", "-1"))));
        verify(journalEntryRepository, never()).save(any());
    }

    @Test
    void rejectsDebitAndCreditOnSameLine() {
        assertThrows(AccountingValidationException.class, () -> accountingService.createJournalEntry(1L, LocalDate.now(), null,
                null, null, List.of(line(10L, "10", "10"), line(20L, "0", "0"))));
        verify(journalEntryRepository, never()).save(any());
    }

    @Test
    void rejectsEntryWithFewerThanTwoLines() {
        assertThrows(AccountingValidationException.class, () -> accountingService.createJournalEntry(1L, LocalDate.now(), null,
                null, null, List.of(line(10L, "10", "0"))));
        verify(journalEntryRepository, never()).save(any());
    }

    private JournalEntryLineRequest line(Long accountId, String debit, String credit) {
        return new JournalEntryLineRequest(accountId, new BigDecimal(debit), new BigDecimal(credit), null);
    }
}
