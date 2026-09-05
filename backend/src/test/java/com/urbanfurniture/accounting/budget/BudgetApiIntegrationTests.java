package com.urbanfurniture.accounting.budget;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ACCOUNTANT")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class BudgetApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void budgetCalculatesRemainingAmountAndCanClose() throws Exception {
        String accountResponse = mockMvc.perform(post("/api/budgets/analytic-accounts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"MARKETING","name":"Marketing"}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long accountId = ((Number) JsonPath.read(accountResponse, "$.id")).longValue();

        String budgetResponse = mockMvc.perform(post("/api/budgets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"2026 Marketing","analyticAccountId":%d,
                                 "startDate":"2026-01-01","endDate":"2026-12-31","plannedAmount":10000.00}
                                """.formatted(accountId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.actualAmount").value(0))
                .andExpect(jsonPath("$.remainingAmount").value(10000))
                .andExpect(jsonPath("$.variance").value(10000))
                .andExpect(jsonPath("$.variancePercentage").value(100))
                .andReturn().getResponse().getContentAsString();
        long budgetId = ((Number) JsonPath.read(budgetResponse, "$.id")).longValue();

        mockMvc.perform(put("/api/budgets/{id}", budgetId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"actualAmount\":2750.50,\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.remainingAmount").value(7249.50))
                .andExpect(jsonPath("$.variance").value(7249.50))
                .andExpect(jsonPath("$.variancePercentage").value(72.5))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mockMvc.perform(post("/api/budgets/{id}/close", budgetId).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    @Test
    void invalidBudgetPeriodIsRejected() throws Exception {
        mockMvc.perform(post("/api/budgets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Invalid","analyticAccountId":999999,
                                 "startDate":"2026-12-31","endDate":"2026-01-01","plannedAmount":100}
                                """))
                .andExpect(status().isBadRequest());
    }
}
