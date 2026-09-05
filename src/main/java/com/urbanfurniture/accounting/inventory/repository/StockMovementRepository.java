package com.urbanfurniture.accounting.inventory.repository;

import com.urbanfurniture.accounting.inventory.entity.StockMovement;
import com.urbanfurniture.accounting.inventory.enums.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    boolean existsByProductIdAndMovementTypeAndReferenceTypeAndReferenceId(
            Long productId, MovementType movementType, String referenceType, String referenceId);

    List<StockMovement> findByProductIdOrderByMovementDateAscIdAsc(Long productId);
}
