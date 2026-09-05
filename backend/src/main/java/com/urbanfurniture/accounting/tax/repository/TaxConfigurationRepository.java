package com.urbanfurniture.accounting.tax.repository;

import com.urbanfurniture.accounting.tax.entity.TaxConfiguration;
import com.urbanfurniture.accounting.tax.enums.TaxType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaxConfigurationRepository extends JpaRepository<TaxConfiguration, Long> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<TaxConfiguration> findAllByOrderByIdAsc();

    Optional<TaxConfiguration> findByIdAndType(Long id, TaxType type);
}
