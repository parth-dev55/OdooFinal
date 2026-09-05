package com.urbanfurniture.accounting.product;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ACCOUNTANT")
class ProductApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void productCrudPaginationAndArchiveEndpointsWork() throws Exception {
        String response = mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"  Teak Dining Table  ","type":"GOODS","salesPrice":45999.99,
                                 "purchasePrice":30000.00,"category":"  Dining Tables  "}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Teak Dining Table"))
                .andExpect(jsonPath("$.salesPrice").value(45999.99))
                .andExpect(jsonPath("$.category").value("Dining Tables"))
                .andExpect(jsonPath("$.active").value(true))
                .andReturn().getResponse().getContentAsString();

        long id = ((Number) com.jayway.jsonpath.JsonPath.read(response, "$.id")).longValue();
        mockMvc.perform(get("/api/products/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("GOODS"));

        mockMvc.perform(get("/api/products?page=0&size=1&sort=name,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(id))
                .andExpect(jsonPath("$.totalElements").value(1));

        mockMvc.perform(put("/api/products/{id}", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"COMBO\",\"salesPrice\":49999.00}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("COMBO"))
                .andExpect(jsonPath("$.salesPrice").value(49999.00));

        mockMvc.perform(patch("/api/products/{id}/deactivate", id).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void invalidPricesAndUnknownProductsReturnClientErrors() throws Exception {
        mockMvc.perform(post("/api/products")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Repair\",\"type\":\"SERVICE\",\"salesPrice\":-1,\"purchasePrice\":0,\"category\":\"Services\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));

        mockMvc.perform(get("/api/products/999999"))
                .andExpect(status().isNotFound());
    }
}
