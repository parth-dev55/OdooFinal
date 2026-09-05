package com.urbanfurniture.accounting.user.controller;

import com.urbanfurniture.accounting.user.dto.AuthMeResponse;
import com.urbanfurniture.accounting.user.dto.CreateProfileRequest;
import com.urbanfurniture.accounting.user.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
    }

    @Test
    void me_withoutAuthentication_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withAuthentication_returnsUserProfile() throws Exception {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("test-uid-123", "token");

        when(authService.getProfile("test-uid-123")).thenReturn(
                new AuthMeResponse("1", "test-uid-123", "Alice", "alice@example.com", "ADMIN")
        );

        mockMvc.perform(get("/api/auth/me").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"))
                .andExpect(jsonPath("$.firebaseUid").value("test-uid-123"))
                .andExpect(jsonPath("$.name").value("Alice"))
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void createProfile_withoutAuthentication_returnsUnauthorized() throws Exception {
        String requestJson = """
                {"name":"Bob","email":"bob@example.com"}
                """;

        mockMvc.perform(post("/api/auth/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createProfile_withAuthentication_returnsCreated() throws Exception {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("test-uid-456", "token");

        String requestJson = """
                {"name":"Bob","email":"bob@example.com"}
                """;

        when(authService.createOrLinkProfile(eq("test-uid-456"), any(CreateProfileRequest.class))).thenReturn(
                new AuthMeResponse("2", "test-uid-456", "Bob", "bob@example.com", "CONTACT")
        );

        mockMvc.perform(post("/api/auth/profile")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
        .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("2"))
                .andExpect(jsonPath("$.role").value("CONTACT"));
    }
}