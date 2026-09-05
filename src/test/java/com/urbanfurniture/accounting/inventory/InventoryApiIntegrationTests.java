package com.urbanfurniture.accounting.inventory;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class InventoryApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @org.springframework.security.test.context.support.WithMockUser
    void tracksStockRejectsOversellingAndAvoidsDuplicateReferences() throws Exception {
        String product = mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Inventory Table","type":"GOODS","salesPrice":100.00,
                                 "purchasePrice":60.00,"category":"Tables"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long productId = ((Number) JsonPath.read(product, "$.id")).longValue();

        String receipt = """
                {"productId":%d,"movementType":"PURCHASE_RECEIPT","quantity":10,
                 "referenceType":"PURCHASE_ORDER","referenceId":"PO-100",
                 "movementDate":"2026-09-05T10:00:00"}
                """.formatted(productId);
        mockMvc.perform(post("/api/inventory/stock-movements")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON).content(receipt))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.movementType").value("PURCHASE_RECEIPT"));

        mockMvc.perform(post("/api/inventory/stock-movements")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON).content(receipt))
                .andExpect(status().isConflict());

        String sale = """
                {"productId":%d,"movementType":"SALE","quantity":4,
                 "referenceType":"SALES_ORDER","referenceId":"SO-100",
                 "movementDate":"2026-09-05T11:00:00"}
                """.formatted(productId);
        mockMvc.perform(post("/api/inventory/stock-movements")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON).content(sale))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/inventory/products/{productId}/stock", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStock").value(6));

        String oversale = sale.replace("\"quantity\":4", "\"quantity\":7")
                .replace("SO-100", "SO-101");
        mockMvc.perform(post("/api/inventory/stock-movements")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON).content(oversale))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/inventory/stock-movements").param("productId", String.valueOf(productId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
