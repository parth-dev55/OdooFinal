package com.urbanfurniture.accounting.sales;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ACCOUNTANT")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class SalesInventoryIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void invoicingConfirmedSalesOrderDecreasesInventory() throws Exception {
        String customer = mockMvc.perform(post("/api/contacts").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Sales Customer","type":"CUSTOMER"}"""))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long customerId = ((Number) JsonPath.read(customer, "$.id")).longValue();
        String user = mockMvc.perform(post("/api/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Sales User","email":"sales@test.local","role":"ACCOUNTANT"}"""))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long userId = ((Number) JsonPath.read(user, "$.id")).longValue();
        String product = mockMvc.perform(post("/api/products").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Sales Chair","type":"GOODS","salesPrice":100.00,
                                "purchasePrice":60.00,"category":"Furniture"}"""))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long productId = ((Number) JsonPath.read(product, "$.id")).longValue();

        mockMvc.perform(post("/api/inventory/movements").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"productId":%d,"movementType":"PURCHASE","quantity":5}"""
                                .formatted(productId)))
                .andExpect(status().isCreated());

        String order = mockMvc.perform(post("/api/sales/orders").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"customerId":%d,"orderDate":"2026-09-05","createdById":%d,
                                "items":[{"productId":%d,"quantity":2,"unitPrice":100.00,"taxAmount":0}]}"""
                                .formatted(customerId, userId, productId)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long orderId = ((Number) JsonPath.read(order, "$.id")).longValue();

        mockMvc.perform(post("/api/sales/orders/{id}/confirm", orderId).with(csrf()))
                .andExpect(status().isOk());

        String receivable = mockMvc.perform(post("/api/accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"1200","name":"Accounts Receivable","type":"ASSET"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long receivableId = ((Number) JsonPath.read(receivable, "$.id")).longValue();
        String revenue = mockMvc.perform(post("/api/accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"4100","name":"Sales Revenue","type":"INCOME"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long revenueId = ((Number) JsonPath.read(revenue, "$.id")).longValue();
        mockMvc.perform(post("/api/journals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Sales Journal","type":"SALES",
                                 "defaultDebitAccountId":%d,"defaultCreditAccountId":%d}
                                """.formatted(receivableId, revenueId)))
                .andExpect(status().isCreated());

        String invoice = mockMvc.perform(post("/api/sales/orders/{id}/invoice", orderId).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"invoiceDate":"2026-09-05","dueDate":"2026-10-05"}"""))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long invoiceId = ((Number) JsonPath.read(invoice, "$.id")).longValue();
        String cash = mockMvc.perform(post("/api/accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"1010","name":"Cash","type":"ASSET"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long cashId = ((Number) JsonPath.read(cash, "$.id")).longValue();
        mockMvc.perform(post("/api/journals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Cash Journal","type":"CASH",
                                 "defaultDebitAccountId":%d,"defaultCreditAccountId":%d}
                                """.formatted(cashId, receivableId)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/sales/payments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"invoiceId":%d,"paymentDate":"2026-09-05","amount":50.00,
                                 "paymentMethod":"CASH","createdById":%d}
                                """.formatted(invoiceId, userId)))
                .andExpect(status().isCreated());
        mockMvc.perform(get("/api/sales/invoices/{id}", invoiceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PARTIALLY_PAID"));
        mockMvc.perform(get("/api/payments").param("customerInvoiceId", String.valueOf(invoiceId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerInvoiceId").value(invoiceId))
                .andExpect(jsonPath("$[0].paymentType").value("CUSTOMER_RECEIPT"));
        mockMvc.perform(get("/api/journal-entries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reference").value(org.hamcrest.Matchers.containsString("INV-")))
                .andExpect(jsonPath("$[1].reference").value(org.hamcrest.Matchers.containsString("PAY-")));
        mockMvc.perform(get("/api/inventory/products/{id}/summary", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(3))
                .andExpect(jsonPath("$.inventoryValue").value(180.00))
                .andExpect(jsonPath("$.averageCost").value(60.00));
    }
}
