package com.urbanfurniture.accounting.sales;

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
@org.springframework.security.test.context.support.WithMockUser(roles = "ADMIN")
class SalesOrderApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void createsConfirmsAndRetrievesSalesOrderWithInvoice() throws Exception {
        long customerId = createCustomer();
        long productId = createProduct();
        receiveStock(productId);

        String order = mockMvc.perform(post("/api/sales-orders")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"customerId":%d,"orderDate":"2026-09-05","items":[
                                {"productId":%d,"quantity":2,"unitPrice":100.00,"tax":18.00}]}
                                """.formatted(customerId, productId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.subtotal").value(200.00))
                .andExpect(jsonPath("$.total").value(236.00))
                .andReturn().getResponse().getContentAsString();
        long orderId = ((Number) JsonPath.read(order, "$.id")).longValue();

        mockMvc.perform(post("/api/sales-orders/{id}/confirm", orderId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INVOICED"))
                .andExpect(jsonPath("$.customerInvoiceId").isNumber());

        mockMvc.perform(get("/api/sales-orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INVOICED"));
        mockMvc.perform(get("/api/inventory/products/{id}/stock", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStock").value(3));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser
    void rejectsConfirmationWhenStockIsUnavailable() throws Exception {
        long customerId = createCustomer();
        long productId = createProduct();
        String order = mockMvc.perform(post("/api/sales-orders")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"customerId":%d,"orderDate":"2026-09-05","items":[
                                {"productId":%d,"quantity":1,"unitPrice":10.00,"tax":0.00}]}
                                """.formatted(customerId, productId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long orderId = ((Number) JsonPath.read(order, "$.id")).longValue();
        mockMvc.perform(post("/api/sales-orders/{id}/confirm", orderId).with(csrf()))
                .andExpect(status().isBadRequest());
    }

    private long createCustomer() throws Exception {
        String response = mockMvc.perform(post("/api/contacts")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Sales Customer\",\"type\":\"CUSTOMER\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(response, "$.id")).longValue();
    }

    private long createProduct() throws Exception {
        String response = mockMvc.perform(post("/api/products")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Sales Product\",\"type\":\"GOODS\",\"salesPrice\":100.00,\"purchasePrice\":50.00,\"category\":\"Goods\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(response, "$.id")).longValue();
    }

    private void receiveStock(long productId) throws Exception {
        mockMvc.perform(post("/api/inventory/stock-movements")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":%d,"movementType":"PURCHASE_RECEIPT","quantity":5,
                                 "referenceType":"PURCHASE_ORDER","referenceId":"SO-RECEIPT-1",
                                 "movementDate":"2026-09-05T09:00:00"}
                                """.formatted(productId)))
                .andExpect(status().isCreated());
    }
}
