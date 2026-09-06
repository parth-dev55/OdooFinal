package com.urbanfurniture.accounting.inventory.repository;

import com.urbanfurniture.accounting.inventory.entity.StockMovement;
import com.urbanfurniture.accounting.inventory.enums.MovementType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("""
            select movement.product.id,
                   sum(case when movement.movementType = :purchaseReceipt
                            then movement.quantity else -movement.quantity end)
            from StockMovement movement
            group by movement.product.id
            """)
    List<Object[]> findCurrentStockByProduct(@Param("purchaseReceipt") MovementType purchaseReceipt);

    boolean existsByProductIdAndMovementTypeAndReferenceTypeAndReferenceId(
            Long productId, MovementType movementType, String referenceType, String referenceId);

    List<StockMovement> findByProductIdOrderByMovementDateAscIdAsc(Long productId);
}
