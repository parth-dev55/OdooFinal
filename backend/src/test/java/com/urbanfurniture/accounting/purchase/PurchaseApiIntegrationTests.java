package com.urbanfurniture.accounting.purchase;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.annotation.DirtiesContext;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ACCOUNTANT")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PurchaseApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void purchaseOrderCanBeApprovedAndBilled() throws Exception {
        String vendorResponse = mockMvc.perform(post("/api/contacts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Northwind Supplies","type":"VENDOR","email":"vendor@northwind.test"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long vendorId = ((Number) JsonPath.read(vendorResponse, "$.id")).longValue();

        String userResponse = mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Purchase Operator","email":"buyer@northwind.test","role":"ACCOUNTANT"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long userId = ((Number) JsonPath.read(userResponse, "$.id")).longValue();

        String taxAccountResponse = mockMvc.perform(post("/api/accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"1410","name":"Purchase Input Tax","type":"ASSET"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long taxAccountId = ((Number) JsonPath.read(taxAccountResponse, "$.id")).longValue();

        String taxResponse = mockMvc.perform(post("/api/tax-configurations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Purchase GST","rate":5.00,"type":"PURCHASE_TAX",
                                 "taxAccountId":%d}
                                """.formatted(taxAccountId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long purchaseTaxId = ((Number) JsonPath.read(taxResponse, "$.id")).longValue();

        String productResponse = mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Oak Desk","type":"GOODS","salesPrice":900.00,
                                 "purchasePrice":500.00,"category":"Office","purchaseTaxId":%d}
                                """.formatted(purchaseTaxId)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long productId = ((Number) JsonPath.read(productResponse, "$.id")).longValue();

        String orderResponse = mockMvc.perform(post("/api/purchases/orders")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"vendorId":%d,"orderDate":"2026-09-05","createdById":%d,
                                 "items":[{"productId":%d,"quantity":2,"unitPrice":500.00,"taxAmount":999.00}]}
                                """.formatted(vendorId, userId, productId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.totalAmount").value(1050.00))
                .andReturn().getResponse().getContentAsString();
        long orderId = ((Number) JsonPath.read(orderResponse, "$.id")).longValue();

        mockMvc.perform(post("/api/purchases/orders/{id}/approve", orderId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        String purchaseAccount = mockMvc.perform(post("/api/accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"5100","name":"Purchase Expense","type":"EXPENSE"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long purchaseAccountId = ((Number) JsonPath.read(purchaseAccount, "$.id")).longValue();

        String payableAccount = mockMvc.perform(post("/api/accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"2100","name":"Accounts Payable","type":"LIABILITY"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long payableAccountId = ((Number) JsonPath.read(payableAccount, "$.id")).longValue();

        mockMvc.perform(post("/api/journals")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Purchase Journal","type":"PURCHASE",
                                 "defaultDebitAccountId":%d,"defaultCreditAccountId":%d}
                                """.formatted(purchaseAccountId, payableAccountId)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/purchases/bills")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"purchaseOrderId":%d,"billDate":"2026-09-05","dueDate":"2026-10-05"}
                                """.formatted(orderId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.outstandingAmount").value(1050.00));

        mockMvc.perform(get("/api/journal-entries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reference").value(org.hamcrest.Matchers.containsString("BILL-")));

        mockMvc.perform(get("/api/purchases/orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BILLED"));
    }

    @Test
    void invalidBillDateIsRejected() throws Exception {
        mockMvc.perform(post("/api/purchases/bills")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"purchaseOrderId":999999,"billDate":"2026-10-05","dueDate":"2026-09-05"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void receivingPurchaseOrderCreatesInventoryStock() throws Exception {
        String vendor = mockMvc.perform(post("/api/contacts").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Receipt Vendor","type":"VENDOR"}"""))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long vendorId = ((Number) JsonPath.read(vendor, "$.id")).longValue();
        String user = mockMvc.perform(post("/api/users").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Receipt User","email":"receipt@test.local","role":"ACCOUNTANT"}"""))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long userId = ((Number) JsonPath.read(user, "$.id")).longValue();
        String product = mockMvc.perform(post("/api/products").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Receipt Table","type":"GOODS","salesPrice":100.00,
                                "purchasePrice":60.00,"category":"Furniture"}"""))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long productId = ((Number) JsonPath.read(product, "$.id")).longValue();

        String order = mockMvc.perform(post("/api/purchases/orders").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"vendorId":%d,"orderDate":"2026-09-05","createdById":%d,
                                "items":[{"productId":%d,"quantity":4,"unitPrice":60.00,"taxAmount":0}]}"""
                                .formatted(vendorId, userId, productId)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long orderId = ((Number) JsonPath.read(order, "$.id")).longValue();

        mockMvc.perform(post("/api/purchases/orders/{id}/approve", orderId).with(csrf()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/purchases/orders/{id}/receive", orderId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEIVED"));
        mockMvc.perform(get("/api/inventory/products/{id}/summary", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(4));
    }
}
