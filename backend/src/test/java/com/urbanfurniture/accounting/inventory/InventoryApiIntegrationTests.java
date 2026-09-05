package com.urbanfurniture.accounting.inventory;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.annotation.DirtiesContext;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ACCOUNTANT")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class InventoryApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void stockMovementsUpdateSummaryAndRejectNegativeStock() throws Exception {
        String productResponse = mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Inventory Chair","type":"GOODS","salesPrice":300.00,
                                 "purchasePrice":180.00,"category":"Furniture"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long productId = ((Number) JsonPath.read(productResponse, "$.id")).longValue();

        mockMvc.perform(post("/api/inventory/movements")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":%d,"movementType":"PURCHASE","quantity":10,
                                 "reference":"PO-TEST"}
                                """.formatted(productId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantity").value(10));

        mockMvc.perform(post("/api/inventory/movements")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":%d,"movementType":"SALE","quantity":3,
                                 "reference":"SO-TEST"}
                                """.formatted(productId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.quantity").value(-3));

        mockMvc.perform(get("/api/inventory/products/{id}/summary", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(7));

        mockMvc.perform(post("/api/inventory/movements")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":%d,"movementType":"SALE","quantity":8}
                                """.formatted(productId)))
                .andExpect(status().isBadRequest());

        String relatedMovement = """
                {"productId":%d,"movementType":"ADJUSTMENT","quantity":1,
                 "relatedTransactionType":"STOCK_ADJUSTMENT","relatedTransactionId":42}
                """.formatted(productId);
        mockMvc.perform(post("/api/inventory/movements")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(relatedMovement))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.relatedTransactionType").value("STOCK_ADJUSTMENT"))
                .andExpect(jsonPath("$.relatedTransactionId").value(42));
        mockMvc.perform(post("/api/inventory/movements")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(relatedMovement))
                .andExpect(status().isBadRequest());
    }
}
