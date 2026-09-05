package com.urbanfurniture.accounting.product.service;

import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.product.dto.CreateProductRequest;
import com.urbanfurniture.accounting.product.dto.ProductResponse;
import com.urbanfurniture.accounting.product.dto.UpdateProductRequest;
import com.urbanfurniture.accounting.product.entity.Product;
import com.urbanfurniture.accounting.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.name().trim());
        product.setType(request.type());
        product.setSalesPrice(request.salesPrice());
        product.setPurchasePrice(request.purchasePrice());
        product.setCategory(request.category().trim());
        product.setActive(request.active() == null || request.active());
        return toResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return toResponse(findProduct(id));
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        Product product = findProduct(id);
        if (request.name() != null) product.setName(request.name().trim());
        if (request.type() != null) product.setType(request.type());
        if (request.salesPrice() != null) product.setSalesPrice(request.salesPrice());
        if (request.purchasePrice() != null) product.setPurchasePrice(request.purchasePrice());
        if (request.category() != null) product.setCategory(request.category().trim());
        if (request.active() != null) product.setActive(request.active());
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse deactivate(Long id) {
        Product product = findProduct(id);
        product.setActive(false);
        return toResponse(productRepository.save(product));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " was not found"));
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(product.getId(), product.getName(), product.getType(), product.getSalesPrice(),
                product.getPurchasePrice(), product.getCategory(), product.isActive(), product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
