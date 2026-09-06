package com.urbanfurniture.accounting.user.service;

import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.user.dto.AuthMeResponse;
import com.urbanfurniture.accounting.user.dto.CreateProfileRequest;
import com.urbanfurniture.accounting.user.entity.User;
import com.urbanfurniture.accounting.user.enums.Role;
import com.urbanfurniture.accounting.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository);
    }

    @Test
    void getProfile_withAdminUser_returnsAdminRole() {
        User user = new User();
        user.setId(1L);
        user.setName("Admin User");
        user.setEmail("admin@urbanfurniture.com");
        user.setRole(Role.ADMIN);
        user.setFirebaseUid("firebase-uid-admin");
        user.setActive(true);

        when(userRepository.findByFirebaseUid("firebase-uid-admin")).thenReturn(Optional.of(user));

        AuthMeResponse response = authService.getProfile("firebase-uid-admin");

        assertNotNull(response);
        assertEquals("1", response.id());
        assertEquals("Admin User", response.name());
        assertEquals("admin@urbanfurniture.com", response.email());
        assertEquals("ADMIN", response.role());
    }

    @Test
    void getProfile_withAccountantUser_returnsAccountantRole() {
        User user = new User();
        user.setId(2L);
        user.setName("Accountant User");
        user.setEmail("accountant@urbanfurniture.com");
        user.setRole(Role.ACCOUNTANT);
        user.setFirebaseUid("firebase-uid-accountant");
        user.setActive(true);

        when(userRepository.findByFirebaseUid("firebase-uid-accountant")).thenReturn(Optional.of(user));

        AuthMeResponse response = authService.getProfile("firebase-uid-accountant");

        assertNotNull(response);
        assertEquals("2", response.id());
        assertEquals("ACCOUNTANT", response.role());
    }

    @Test
    void getProfile_withContactUser_returnsContactRole() {
        User user = new User();
        user.setId(3L);
        user.setName("Contact User");
        user.setEmail("contact@urbanfurniture.com");
        user.setRole(Role.CONTACT);
        user.setFirebaseUid("firebase-uid-contact");
        user.setActive(true);

        when(userRepository.findByFirebaseUid("firebase-uid-contact")).thenReturn(Optional.of(user));

        AuthMeResponse response = authService.getProfile("firebase-uid-contact");

        assertNotNull(response);
        assertEquals("3", response.id());
        assertEquals("CONTACT", response.role());
    }

    @Test
    void getProfile_unknownUser_throwsResourceNotFoundException_neverDefaultsToAdmin() {
        when(userRepository.findByFirebaseUid("unknown-uid")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getProfile("unknown-uid"));
    }

    @Test
    void getProfile_deactivatedUser_throwsResourceNotFoundException() {
        User user = new User();
        user.setId(4L);
        user.setRole(Role.ACCOUNTANT);
        user.setFirebaseUid("deactivated-uid");
        user.setActive(false);

        when(userRepository.findByFirebaseUid("deactivated-uid")).thenReturn(Optional.of(user));

        assertThrows(ResourceNotFoundException.class, () -> authService.getProfile("deactivated-uid"));
    }

    @Test
    void createOrLinkProfile_whenEmailExists_linksFirebaseUid() {
        User existingUser = new User();
        existingUser.setId(5L);
        existingUser.setName("Pre-created User");
        existingUser.setEmail("precreated@urbanfurniture.com");
        existingUser.setRole(Role.ACCOUNTANT);
        existingUser.setActive(true);

        when(userRepository.findByFirebaseUid("new-uid")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("precreated@urbanfurniture.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateProfileRequest request = new CreateProfileRequest(
                null, null, "Pre-created User", "precreated@urbanfurniture.com", null);

        AuthMeResponse response = authService.createOrLinkProfile("new-uid", request);

        assertEquals("5", response.id());
        assertEquals("ACCOUNTANT", response.role());
        assertEquals("new-uid", response.firebaseUid());
    }

    @Test
    void createOrLinkProfile_newRegistration_defaultsToContact_neverAdmin() {
        when(userRepository.findByFirebaseUid("self-registered-uid")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("newuser@urbanfurniture.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        // Even if request specifies ADMIN, public signup must NEVER grant ADMIN
        CreateProfileRequest request = new CreateProfileRequest(
                null, null, "Hacker", "newuser@urbanfurniture.com", Role.ADMIN);

        AuthMeResponse response = authService.createOrLinkProfile("self-registered-uid", request);

        assertEquals("10", response.id());
        assertEquals("CONTACT", response.role());
        assertNotEquals("ADMIN", response.role());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals(Role.CONTACT, captor.getValue().getRole());
        assertEquals("self-registered-uid", captor.getValue().getFirebaseUid());
    }
}