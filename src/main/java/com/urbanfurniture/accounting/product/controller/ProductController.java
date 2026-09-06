package com.urbanfurniture.accounting.product.controller;

import com.urbanfurniture.accounting.product.dto.CreateProductRequest;
import com.urbanfurniture.accounting.product.dto.ProductResponse;
import com.urbanfurniture.accounting.product.dto.ProductPageResponse;
import com.urbanfurniture.accounting.product.dto.UpdateProductRequest;
import com.urbanfurniture.accounting.product.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @GetMapping
    public ProductPageResponse findAll(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ProductPageResponse.from(productService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable @Positive Long id) {
        return productService.findById(id);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable @Positive Long id, @Valid @RequestBody UpdateProductRequest request) {
        return productService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public ProductResponse deactivate(@PathVariable @Positive Long id) {
        return productService.deactivate(id);
    }
}
