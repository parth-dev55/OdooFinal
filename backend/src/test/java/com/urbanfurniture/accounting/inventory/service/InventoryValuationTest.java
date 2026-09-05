package com.urbanfurniture.accounting.inventory.service;

import com.urbanfurniture.accounting.inventory.dto.StockAdjustmentRequest;
import com.urbanfurniture.accounting.inventory.entity.StockMovement;
import com.urbanfurniture.accounting.inventory.enums.StockMovementType;
import com.urbanfurniture.accounting.inventory.repository.StockMovementRepository;
import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class InventoryValuationTest {

    @Test
    void appliesWeightedAverageCostToInboundAndOutboundMovements() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Chair");
        product.setPurchasePrice(new BigDecimal("60.00"));
        StockMovement first = movement(product, StockMovementType.PURCHASE, "5", "60.00", "300.00");

        StockMovementRepository movements = mock(StockMovementRepository.class);
        ProductRepository products = mock(ProductRepository.class);
        when(products.findById(1L)).thenReturn(Optional.of(product));
        when(movements.findByProductIdOrderByMovementDateDescIdDesc(1L)).thenReturn(List.of(first));
        when(movements.save(any(StockMovement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var service = new InventoryService(movements, products);
        var inbound = service.recordMovement(new StockAdjustmentRequest(1L, StockMovementType.PURCHASE,
                new BigDecimal("5"), new BigDecimal("70"), LocalDateTime.now(),
                "PO-1", null, null, null, null, null));

        assertEquals(new BigDecimal("70.00"), inbound.unitCost());
        assertEquals(new BigDecimal("350.00"), inbound.totalCost());

        StockMovement second = movement(product, StockMovementType.PURCHASE, "5", "70.00", "350.00");
        when(movements.findByProductIdOrderByMovementDateDescIdDesc(1L)).thenReturn(List.of(second, first));
        var outbound = service.recordMovement(new StockAdjustmentRequest(1L, StockMovementType.SALE,
                new BigDecimal("4"), null, LocalDateTime.now(),
                "INV-1", null, null, null, null, null));

        assertEquals(new BigDecimal("65.00"), outbound.unitCost());
        assertEquals(new BigDecimal("-260.00"), outbound.totalCost());
    }

    private StockMovement movement(Product product, StockMovementType type, String quantity,
                                   String unitCost, String totalCost) {
        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setMovementType(type);
        movement.setQuantity(new BigDecimal(quantity));
        movement.setUnitCost(new BigDecimal(unitCost));
        movement.setTotalCost(new BigDecimal(totalCost));
        movement.setMovementDate(LocalDateTime.now());
        return movement;
    }
}
