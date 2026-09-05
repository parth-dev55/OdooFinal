package com.urbanfurniture.accounting.purchase;

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
class PurchaseOrderApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @org.springframework.security.test.context.support.WithMockUser
    void createsConfirmsReceivesAndBillsPurchaseOrder() throws Exception {
        long vendorId = createVendor();
        long productId = createProduct();
        String order = mockMvc.perform(post("/api/purchase-orders")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"vendorId":%d,"orderDate":"2026-09-05","items":[
                                {"productId":%d,"quantity":5,"unitPrice":50.00}]}
                                """.formatted(vendorId, productId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.total").value(250.00))
                .andReturn().getResponse().getContentAsString();
        long orderId = ((Number) JsonPath.read(order, "$.id")).longValue();
        long itemId = ((Number) JsonPath.read(order, "$.items[0].id")).longValue();

        mockMvc.perform(post("/api/purchase-orders/{id}/confirm", orderId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
        mockMvc.perform(post("/api/purchase-orders/{id}/receive", orderId)
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[{\"itemId\":" + itemId + ",\"quantity\":5}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BILLED"))
                .andExpect(jsonPath("$.vendorBillId").isNumber());
        mockMvc.perform(get("/api/inventory/products/{id}/stock", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStock").value(5));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser
    void rejectsReceivingMoreThanOrdered() throws Exception {
        long vendorId = createVendor();
        long productId = createProduct();
        String order = mockMvc.perform(post("/api/purchase-orders")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"vendorId":%d,"orderDate":"2026-09-05","items":[
                                {"productId":%d,"quantity":2,"unitPrice":50.00}]}
                                """.formatted(vendorId, productId)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long orderId = ((Number) JsonPath.read(order, "$.id")).longValue();
        long itemId = ((Number) JsonPath.read(order, "$.items[0].id")).longValue();
        mockMvc.perform(post("/api/purchase-orders/{id}/confirm", orderId).with(csrf()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/purchase-orders/{id}/receive", orderId)
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[{\"itemId\":" + itemId + ",\"quantity\":3}]}"))
                .andExpect(status().isBadRequest());
    }

    private long createVendor() throws Exception {
        String response = mockMvc.perform(post("/api/contacts")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Purchase Vendor\",\"type\":\"VENDOR\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(response, "$.id")).longValue();
    }

    private long createProduct() throws Exception {
        String response = mockMvc.perform(post("/api/products")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Purchase Product\",\"type\":\"GOODS\",\"salesPrice\":100.00,\"purchasePrice\":50.00,\"category\":\"Goods\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(response, "$.id")).longValue();
    }
}
