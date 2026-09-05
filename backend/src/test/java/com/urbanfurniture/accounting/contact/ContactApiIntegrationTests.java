package com.urbanfurniture.accounting.contact;

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
class ContactApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contactCrudAndArchiveEndpointsWork() throws Exception {
        String createRequest = """
                {"name":"  Acme Furnishings  ","type":"BOTH","email":"SALES@acme.example",
                 "mobile":"+91 98765 43210","address":{"addressLine":"12 Market Road","city":"Pune","state":"Maharashtra","pincode":"411001"},
                 "profileImageUrl":"https://cdn.example/acme.png"}
                """;

        String response = mockMvc.perform(post("/api/contacts")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON).content(createRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Acme Furnishings"))
                .andExpect(jsonPath("$.email").value("sales@acme.example"))
                .andExpect(jsonPath("$.active").value(true))
                .andReturn().getResponse().getContentAsString();

        long id = ((Number) com.jayway.jsonpath.JsonPath.read(response, "$.id")).longValue();
        mockMvc.perform(get("/api/contacts/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address.city").value("Pune"));

        mockMvc.perform(get("/api/contacts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id));

        mockMvc.perform(put("/api/contacts/{id}", id)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Acme Furniture\",\"type\":\"CUSTOMER\",\"mobile\":\"9876543210\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme Furniture"))
                .andExpect(jsonPath("$.type").value("CUSTOMER"));

        mockMvc.perform(patch("/api/contacts/{id}/deactivate", id).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void validationAndNotFoundReturnClientErrors() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"type\":\"CUSTOMER\",\"email\":\"invalid\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));

        mockMvc.perform(get("/api/contacts/999999"))
                .andExpect(status().isNotFound());
    }
}
