package com.urbanfurniture.accounting.inventory.service;

import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.inventory.dto.CreateStockMovementRequest;
import com.urbanfurniture.accounting.inventory.dto.StockMovementResponse;
import com.urbanfurniture.accounting.inventory.dto.StockResponse;
import com.urbanfurniture.accounting.inventory.entity.StockMovement;
import com.urbanfurniture.accounting.inventory.enums.MovementType;
import com.urbanfurniture.accounting.inventory.exception.InventoryValidationException;
import com.urbanfurniture.accounting.inventory.repository.StockMovementRepository;
import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional
    public StockMovementResponse createMovement(CreateStockMovementRequest request) {
        Product product = productRepository.findByIdForUpdate(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product " + request.productId() + " was not found"));

        String referenceType = request.referenceType().trim();
        String referenceId = request.referenceId().trim();
        if (stockMovementRepository.existsByProductIdAndMovementTypeAndReferenceTypeAndReferenceId(
                product.getId(), request.movementType(), referenceType, referenceId)) {
            throw new DuplicateResourceException("Stock movement already exists for "
                    + referenceType + "/" + referenceId);
        }

        BigDecimal currentStock = calculateCurrentStock(product.getId());
        if (request.movementType() == MovementType.SALE
                && currentStock.compareTo(request.quantity()) < 0) {
            throw new InventoryValidationException("Insufficient stock for product " + product.getId());
        }

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setMovementType(request.movementType());
        movement.setQuantity(request.quantity());
        movement.setReferenceType(referenceType);
        movement.setReferenceId(referenceId);
        movement.setMovementDate(request.movementDate());
        return StockMovementResponse.from(stockMovementRepository.save(movement));
    }

    @Transactional(readOnly = true)
    public void ensureAvailable(Long productId, BigDecimal quantity) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + productId + " was not found"));
        if (calculateCurrentStock(productId).compareTo(quantity) < 0) {
            throw new InventoryValidationException("Insufficient stock for product " + productId);
        }
    }

    @Transactional(readOnly = true)
    public StockResponse getCurrentStock(Long productId) {
        ensureProductExists(productId);
        return new StockResponse(productId, calculateCurrentStock(productId));
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> listMovements(Long productId) {
        ensureProductExists(productId);
        return stockMovementRepository.findByProductIdOrderByMovementDateAscIdAsc(productId)
                .stream()
                .map(StockMovementResponse::from)
                .toList();
    }

    private BigDecimal calculateCurrentStock(Long productId) {
        return stockMovementRepository.findByProductIdOrderByMovementDateAscIdAsc(productId).stream()
                .map(movement -> movement.getMovementType() == MovementType.PURCHASE_RECEIPT
                        ? movement.getQuantity()
                        : movement.getQuantity().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void ensureProductExists(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product " + productId + " was not found");
        }
    }
}
