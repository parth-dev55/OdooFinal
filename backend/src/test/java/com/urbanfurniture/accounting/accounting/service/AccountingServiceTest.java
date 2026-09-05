package com.urbanfurniture.accounting.accounting.service;

import com.urbanfurniture.accounting.accounting.dto.JournalEntryLineRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalEntryResponse;
import com.urbanfurniture.accounting.accounting.dto.UpdateJournalEntryRequest;
import com.urbanfurniture.accounting.accounting.entity.Account;
import com.urbanfurniture.accounting.accounting.entity.Journal;
import com.urbanfurniture.accounting.accounting.entity.JournalEntry;
import com.urbanfurniture.accounting.accounting.enums.JournalEntryStatus;
import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalEntryRepository;
import com.urbanfurniture.accounting.accounting.repository.JournalRepository;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
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
        lenient().when(journalRepository.findById(1L)).thenReturn(Optional.of(journal));

        Account account = new Account();
        account.setCode("1000");
        account.setName("Cash");
        lenient().when(accountRepository.findById(any())).thenReturn(Optional.of(account));
        lenient().when(journalEntryRepository.save(any(JournalEntry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
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

    @Test
    void rejectsDuplicatePostedReference() {
        when(journalEntryRepository.existsByReferenceAndStatus("SALE-1", JournalEntryStatus.POSTED))
                .thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> accountingService.createJournalEntry(
                1L, LocalDate.now(), " SALE-1 ", null, JournalEntryStatus.POSTED,
                List.of(line(10L, "100", "0"), line(20L, "0", "100"))));
        verify(journalEntryRepository, never()).save(any());
    }

    @Test
    void rejectsInactiveAccount() {
        Account inactive = new Account();
        inactive.setCode("2000");
        inactive.setName("Inactive");
        inactive.setActive(false);
        when(accountRepository.findById(20L)).thenReturn(Optional.of(inactive));

        assertThrows(AccountingValidationException.class, () -> accountingService.createJournalEntry(
                1L, LocalDate.now(), null, null, JournalEntryStatus.POSTED,
                List.of(line(10L, "100", "0"), line(20L, "0", "100"))));
        verify(journalEntryRepository, never()).save(any());
    }

    @Test
    void updatesDraftEntry() {
        JournalEntry draft = entry(JournalEntryStatus.DRAFT);
        when(journalEntryRepository.findById(5L)).thenReturn(Optional.of(draft));

        accountingService.updateDraft(5L, new UpdateJournalEntryRequest(
                1L, LocalDate.now(), "DRAFT-UPDATED", "Updated",
                List.of(line(10L, "125", "0"), line(20L, "0", "125"))));

        assertEquals("DRAFT-UPDATED", draft.getReference());
        assertEquals(2, draft.getLines().size());
        verify(journalEntryRepository).save(draft);
    }

    @Test
    void postsDraftEntry() {
        JournalEntry draft = entry(JournalEntryStatus.DRAFT);
        when(journalEntryRepository.findById(5L)).thenReturn(Optional.of(draft));
        when(journalEntryRepository.existsByReferenceAndStatus("DRAFT-1", JournalEntryStatus.POSTED))
                .thenReturn(false);

        accountingService.post(5L);

        assertEquals(JournalEntryStatus.POSTED, draft.getStatus());
        verify(journalEntryRepository).save(draft);
    }

    @Test
    void rejectsEditingPostedEntry() {
        JournalEntry posted = entry(JournalEntryStatus.POSTED);
        when(journalEntryRepository.findById(5L)).thenReturn(Optional.of(posted));

        assertThrows(AccountingValidationException.class, () ->
                accountingService.updateDraft(5L, new UpdateJournalEntryRequest(
                        1L, LocalDate.now(), "NEW", null,
                        List.of(line(10L, "100", "0"), line(20L, "0", "100")))));
    }

    @Test
    void reversesPostedEntryWithOppositeLines() {
        JournalEntry posted = entry(JournalEntryStatus.POSTED);
        when(journalEntryRepository.findById(5L)).thenReturn(Optional.of(posted));
        when(journalEntryRepository.existsByReferenceAndStatus("REVERSAL-5", JournalEntryStatus.POSTED))
                .thenReturn(false);

        JournalEntryResponse response = accountingService.reverse(5L);

        assertEquals(JournalEntryStatus.REVERSED, posted.getStatus());
        assertEquals(JournalEntryStatus.POSTED, response.status());
        verify(journalEntryRepository, org.mockito.Mockito.times(2)).save(any(JournalEntry.class));
    }

    private JournalEntry entry(JournalEntryStatus status) {
        Journal journal = new Journal();
        journal.setId(1L);
        journal.setName("General");
        JournalEntry entry = new JournalEntry();
        entry.setId(5L);
        entry.setJournal(journal);
        entry.setEntryDate(LocalDate.now());
        entry.setReference("DRAFT-1");
        entry.setStatus(status);
        entry.addLine(lineEntity(10L, "100", "0"));
        entry.addLine(lineEntity(20L, "0", "100"));
        return entry;
    }

    private com.urbanfurniture.accounting.accounting.entity.JournalEntryLine lineEntity(
            Long accountId, String debit, String credit) {
        Account account = new Account();
        account.setId(accountId);
        account.setCode(String.valueOf(accountId));
        account.setName(String.valueOf(accountId));
        com.urbanfurniture.accounting.accounting.entity.JournalEntryLine line =
                new com.urbanfurniture.accounting.accounting.entity.JournalEntryLine();
        line.setAccount(account);
        line.setDebit(new BigDecimal(debit));
        line.setCredit(new BigDecimal(credit));
        return line;
    }

    private JournalEntryLineRequest line(Long accountId, String debit, String credit) {
        return new JournalEntryLineRequest(accountId, new BigDecimal(debit), new BigDecimal(credit), null);
    }
}
