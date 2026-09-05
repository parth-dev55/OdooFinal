package com.urbanfurniture.accounting.accounting.entity;

import com.urbanfurniture.accounting.budget.entity.AnalyticAccount;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "journal_entry_lines", indexes = {
        @Index(name = "idx_journal_entry_lines_account", columnList = "account_id"),
        @Index(name = "idx_journal_entry_lines_entry", columnList = "journal_entry_id"),
        @Index(name = "idx_journal_entry_lines_analytic", columnList = "analytic_account_id")
})
@Getter
@Setter
@NoArgsConstructor
public class JournalEntryLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "journal_entry_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_journal_entry_line_entry"))
    private JournalEntry journalEntry;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false, foreignKey = @ForeignKey(name = "fk_journal_entry_line_account"))
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analytic_account_id",
            foreignKey = @ForeignKey(name = "fk_journal_entry_line_analytic_account"))
    private AnalyticAccount analyticAccount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal debit;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal credit;

    @Column(length = 1000)
    private String description;
}
