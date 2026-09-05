package com.urbanfurniture.accounting.budget;

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
class BudgetApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @org.springframework.security.test.context.support.WithMockUser
    void createsAndSummarizesBudget() throws Exception {
        String account = mockMvc.perform(post("/api/analytic-accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Operations Budget\",\"type\":\"EXPENSE\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long accountId = ((Number) JsonPath.read(account, "$.id")).longValue();

        String budget = mockMvc.perform(post("/api/budgets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Q1 Operations","periodStart":"2026-01-01","periodEnd":"2026-03-31",
                                 "plannedAmount":10000.00,"responsiblePerson":"Alex",
                                 "analyticAccountId":%d}
                                """.formatted(accountId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.analyticAccount.id").value(accountId))
                .andExpect(jsonPath("$.plannedAmount").value(10000.00))
                .andReturn().getResponse().getContentAsString();
        long budgetId = ((Number) JsonPath.read(budget, "$.id")).longValue();

        mockMvc.perform(get("/api/budgets/{id}/summary", budgetId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plannedAmount").value(10000.00))
                .andExpect(jsonPath("$.actualAmount").value(0.00))
                .andExpect(jsonPath("$.remainingAmount").value(10000.00))
                .andExpect(jsonPath("$.utilizationPercentage").value(0.00));

        mockMvc.perform(get("/api/analytic-accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mockMvc.perform(get("/api/budgets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser
    void rejectsInvalidBudgetRangeAndAmount() throws Exception {
        String account = mockMvc.perform(post("/api/analytic-accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Invalid Budget Account\",\"type\":\"INCOME\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long accountId = ((Number) JsonPath.read(account, "$.id")).longValue();

        String invalid = """
                {"name":"Invalid","periodStart":"2026-04-01","periodEnd":"2026-03-01",
                 "plannedAmount":0,"responsiblePerson":"Alex","analyticAccountId":%d}
                """.formatted(accountId);
        mockMvc.perform(post("/api/budgets")
                        .with(csrf()).contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest());
    }
}
