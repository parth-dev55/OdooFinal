package com.urbanfurniture.accounting.inventory.service;

import com.urbanfurniture.accounting.accounting.exception.AccountingValidationException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.inventory.dto.StockAdjustmentRequest;
import com.urbanfurniture.accounting.inventory.dto.StockMovementResponse;
import com.urbanfurniture.accounting.inventory.dto.StockSummaryResponse;
import com.urbanfurniture.accounting.inventory.entity.StockMovement;
import com.urbanfurniture.accounting.inventory.enums.StockMovementType;
import com.urbanfurniture.accounting.inventory.repository.StockMovementRepository;
import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final StockMovementRepository movements;
    private final ProductRepository products;

    @Transactional
    public StockMovementResponse recordMovement(StockAdjustmentRequest request) {
        Product product = products.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product " + request.productId() + " was not found"));
        if (!product.isActive()) {
            throw new AccountingValidationException("Product " + product.getId() + " is inactive");
        }
        if (request.relatedTransactionType() != null && request.relatedTransactionId() != null
                && movements.existsByProductIdAndMovementTypeAndRelatedTransactionTypeAndRelatedTransactionId(
                product.getId(), request.movementType(), request.relatedTransactionType(),
                request.relatedTransactionId())) {
            throw new AccountingValidationException("Inventory movement already exists for "
                    + request.relatedTransactionType() + " " + request.relatedTransactionId());
        }

        BigDecimal delta = signedQuantity(request.movementType(), request.quantity());
        Valuation current = currentValuation(product.getId());
        if (current.quantity().add(delta).signum() < 0) {
            throw new AccountingValidationException("Insufficient stock for product " + product.getId());
        }
        BigDecimal unitCost = resolveUnitCost(request, product, delta, current);
        BigDecimal totalCost = delta.signum() < 0
                ? unitCost.multiply(delta.abs()).negate()
                : unitCost.multiply(delta);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setMovementType(request.movementType());
        movement.setQuantity(delta);
        movement.setUnitCost(unitCost);
        movement.setTotalCost(totalCost);
        movement.setMovementDate(request.movementDate() == null ? LocalDateTime.now() : request.movementDate());
        movement.setReference(trim(request.reference()));
        movement.setSource(trim(request.source()));
        movement.setDestination(trim(request.destination()));
        movement.setNotes(trim(request.notes()));
        movement.setRelatedTransactionType(trim(request.relatedTransactionType()));
        movement.setRelatedTransactionId(request.relatedTransactionId());
        return response(movements.save(movement));
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> findMovements(Long productId) {
        List<StockMovement> result = productId == null
                ? movements.findAll()
                : movements.findByProductIdOrderByMovementDateDescIdDesc(productId);
        return result.stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public StockSummaryResponse findSummary(Long productId) {
        Product product = products.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + productId + " was not found"));
        Valuation valuation = currentValuation(productId);
        BigDecimal averageCost = valuation.quantity().signum() == 0
                ? BigDecimal.ZERO.setScale(2)
                : valuation.value().divide(valuation.quantity(), 2, RoundingMode.HALF_UP);
        return new StockSummaryResponse(product.getId(), product.getName(), valuation.quantity(),
                valuation.value(), averageCost);
    }

    private BigDecimal signedQuantity(StockMovementType type, BigDecimal quantity) {
        if (quantity.signum() == 0) {
            throw new AccountingValidationException("Stock quantity cannot be zero");
        }
        if ((type == StockMovementType.PURCHASE || type == StockMovementType.RETURN)
                && quantity.signum() < 0) {
            throw new AccountingValidationException(type + " quantity must be positive");
        }
        if (type == StockMovementType.SALE && quantity.signum() < 0) {
            throw new AccountingValidationException("SALE quantity must be positive");
        }
        return type == StockMovementType.SALE ? quantity.negate() : quantity;
    }

    private Valuation currentValuation(Long productId) {
        return movements.findByProductIdOrderByMovementDateDescIdDesc(productId).stream()
                .reduce(new Valuation(BigDecimal.ZERO, BigDecimal.ZERO),
                        (valuation, movement) -> new Valuation(
                                valuation.quantity().add(movement.getQuantity()),
                                valuation.value().add(movement.getTotalCost() == null
                                        ? BigDecimal.ZERO : movement.getTotalCost())),
                        (left, right) -> new Valuation(left.quantity().add(right.quantity()),
                                left.value().add(right.value())));
    }

    private StockMovementResponse response(StockMovement movement) {
        return new StockMovementResponse(movement.getId(), movement.getProduct().getId(),
                movement.getProduct().getName(), movement.getMovementType(), movement.getQuantity(),
                movement.getUnitCost(), movement.getTotalCost(),
                movement.getMovementDate(), movement.getReference(), movement.getSource(),
                movement.getDestination(), movement.getNotes(), movement.getRelatedTransactionType(),
                movement.getRelatedTransactionId());
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private BigDecimal resolveUnitCost(StockAdjustmentRequest request, Product product,
                                       BigDecimal delta, Valuation current) {
        if (delta.signum() < 0) {
            if (current.quantity().signum() == 0) {
                throw new AccountingValidationException("Cannot value an outbound movement without stock");
            }
            return current.value().divide(current.quantity(), 2, RoundingMode.HALF_UP);
        }
        if (request.unitCost() != null) {
            if (request.unitCost().signum() < 0) {
                throw new AccountingValidationException("Unit cost cannot be negative");
            }
            return request.unitCost().setScale(2, RoundingMode.HALF_UP);
        }
        if (product.getPurchasePrice() == null || product.getPurchasePrice().signum() < 0) {
            throw new AccountingValidationException("A nonnegative product purchase price is required for valuation");
        }
        return product.getPurchasePrice().setScale(2, RoundingMode.HALF_UP);
    }

    private record Valuation(BigDecimal quantity, BigDecimal value) {
    }
}
