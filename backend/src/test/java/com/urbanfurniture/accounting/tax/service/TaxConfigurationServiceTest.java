package com.urbanfurniture.accounting.tax.service;

import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.accounting.repository.AccountRepository;
import com.urbanfurniture.accounting.tax.dto.CreateTaxConfigurationRequest;
import com.urbanfurniture.accounting.tax.dto.UpdateTaxConfigurationRequest;
import com.urbanfurniture.accounting.tax.entity.TaxConfiguration;
import com.urbanfurniture.accounting.tax.enums.TaxType;
import com.urbanfurniture.accounting.tax.repository.TaxConfigurationRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TaxConfigurationServiceTest {

    @Test
    void rejectsInactiveTaxConfigurationDuringResolution() {
        TaxConfiguration tax = new TaxConfiguration();
        tax.setId(1L);
        tax.setType(TaxType.SALES_TAX);
        tax.setActive(false);

        TaxConfigurationRepository repository = mock(TaxConfigurationRepository.class);
        when(repository.findById(1L)).thenReturn(Optional.of(tax));

        assertThrows(AccountingValidationException.class, () ->
                new TaxConfigurationService(repository, mock(AccountRepository.class))
                        .resolveActive(1L, TaxType.SALES_TAX));
    }

    @Test
    void createsConfiguredRate() {
        TaxConfigurationRepository repository = mock(TaxConfigurationRepository.class);
        when(repository.existsByNameIgnoreCase("GST")).thenReturn(false);
        when(repository.save(any(TaxConfiguration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = new TaxConfigurationService(repository, mock(AccountRepository.class)).create(
                new CreateTaxConfigurationRequest(" GST ", new BigDecimal("18.00"),
                        TaxType.SALES_TAX, null, true));

        org.junit.jupiter.api.Assertions.assertEquals("GST", response.name());
        org.junit.jupiter.api.Assertions.assertEquals(new BigDecimal("18.00"), response.rate());
    }

    @Test
    void rejectsBlankUpdatedName() {
        TaxConfiguration tax = new TaxConfiguration();
        tax.setId(1L);
        tax.setName("GST");
        TaxConfigurationRepository repository = mock(TaxConfigurationRepository.class);
        when(repository.findById(1L)).thenReturn(Optional.of(tax));

        assertThrows(AccountingValidationException.class, () ->
                new TaxConfigurationService(repository, mock(AccountRepository.class)).update(1L,
                        new UpdateTaxConfigurationRequest(" ", null, null, null, null)));
    }

    @Test
    void rejectsRateOutsideAllowedRange() {
        TaxConfigurationRepository repository = mock(TaxConfigurationRepository.class);
        when(repository.existsByNameIgnoreCase("Invalid")).thenReturn(false);

        assertThrows(AccountingValidationException.class, () ->
                new TaxConfigurationService(repository, mock(AccountRepository.class)).create(
                        new CreateTaxConfigurationRequest("Invalid", new BigDecimal("100.01"),
                                TaxType.SALES_TAX, null, true)));
    }
}
