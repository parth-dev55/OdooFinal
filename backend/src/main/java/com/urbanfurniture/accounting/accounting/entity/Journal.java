package com.urbanfurniture.accounting.accounting.entity;

import com.urbanfurniture.accounting.accounting.enums.JournalType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "journals")
@Getter
@Setter
@NoArgsConstructor
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private JournalType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_debit_account_id",
            foreignKey = @ForeignKey(name = "fk_journal_default_debit_account"))
    private Account defaultDebitAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_credit_account_id",
            foreignKey = @ForeignKey(name = "fk_journal_default_credit_account"))
    private Account defaultCreditAccount;

    @Column(nullable = false)
    private boolean active = true;
}
