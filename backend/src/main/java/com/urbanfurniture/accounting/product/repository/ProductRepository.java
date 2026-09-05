package com.urbanfurniture.accounting.product.repository;

import com.urbanfurniture.accounting.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
