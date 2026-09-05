package com.urbanfurniture.accounting.inventory.repository;

import com.urbanfurniture.accounting.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByProductIdOrderByMovementDateDescIdDesc(Long productId);

    boolean existsByProductIdAndMovementTypeAndRelatedTransactionTypeAndRelatedTransactionId(
            Long productId, com.urbanfurniture.accounting.inventory.enums.StockMovementType movementType,
            String relatedTransactionType, Long relatedTransactionId);
}
