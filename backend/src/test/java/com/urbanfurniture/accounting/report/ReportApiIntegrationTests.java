package com.urbanfurniture.accounting.report;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "ACCOUNTANT")
class ReportApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void emptyReportsReturnZeroTotals() throws Exception {
        mockMvc.perform(get("/api/reports/balance-sheet")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDebits").value(0))
                .andExpect(jsonPath("$.totalCredits").value(0))
                .andExpect(jsonPath("$.assets").value(0))
                .andExpect(jsonPath("$.liabilities").value(0))
                .andExpect(jsonPath("$.capital").value(0))
                .andExpect(jsonPath("$.currentPeriodProfit").value(0))
                .andExpect(jsonPath("$.accountingEquationBalanced").value(true))
                .andExpect(jsonPath("$.accounts").isArray());

        mockMvc.perform(get("/api/reports/profit-loss")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.income").value(0))
                .andExpect(jsonPath("$.expenses").value(0))
                .andExpect(jsonPath("$.netProfit").value(0))
                .andExpect(jsonPath("$.netResult").value(0));

        mockMvc.perform(get("/api/reports/budget")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plannedAmount").value(0))
                .andExpect(jsonPath("$.actualAmount").value(0));
    }

    @Test
    void invalidDateRangeIsRejected() throws Exception {
        mockMvc.perform(get("/api/reports/balance-sheet")
                        .param("startDate", "2026-12-31")
                        .param("endDate", "2026-01-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void supportsDateAliasesAndAsOf() throws Exception {
        mockMvc.perform(get("/api/reports/profit-loss")
                        .param("from", "2026-01-01")
                        .param("to", "2026-12-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.income").value(0));

        mockMvc.perform(get("/api/reports/budget")
                        .param("asOf", "2026-06-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plannedAmount").value(0));
    }

    @Test
    void rejectsReportsWithoutDateParameters() throws Exception {
        mockMvc.perform(get("/api/reports/balance-sheet"))
                .andExpect(status().isBadRequest());
    }
}
