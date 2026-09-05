package com.urbanfurniture.accounting.console.menu;

import com.urbanfurniture.accounting.console.ConsoleMenu;
import com.urbanfurniture.accounting.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductMenu implements ConsoleMenu {
    private final ProductService service;

    public String getMenuName() { return "products"; }

    public void execute() {
        System.out.println("Products: " + service.findAll(PageRequest.of(0, 100)).getTotalElements());
    }
}
