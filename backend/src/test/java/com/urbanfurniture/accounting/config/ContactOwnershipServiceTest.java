package com.urbanfurniture.accounting.config;

import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.user.entity.User;
import com.urbanfurniture.accounting.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ContactOwnershipServiceTest {

    @Test
    void contactUserCanAccessOnlyLinkedContact() {
        UserRepository repository = mock(UserRepository.class);
        ContactOwnershipService service = new ContactOwnershipService(repository);
        Contact ownedContact = contact(10L);
        User user = new User();
        user.setContact(ownedContact);
        when(repository.findByFirebaseUid("firebase-user")).thenReturn(Optional.of(user));
        var authentication = authentication("firebase-user", "ROLE_CONTACT_USER");

        assertDoesNotThrow(() -> service.requireOwner(authentication, ownedContact));
        assertThrows(AccessDeniedException.class, () -> service.requireOwner(authentication, contact(20L)));
    }

    @Test
    void accountantIsNotSubjectToContactOwnershipFilter() {
        ContactOwnershipService service = new ContactOwnershipService(mock(UserRepository.class));
        assertDoesNotThrow(() -> service.requireOwner(
                authentication("accountant", "ROLE_ACCOUNTANT"), contact(10L)));
    }

    private UsernamePasswordAuthenticationToken authentication(String name, String authority) {
        return new UsernamePasswordAuthenticationToken(name, null,
                List.of(new SimpleGrantedAuthority(authority)));
    }

    private Contact contact(Long id) {
        Contact contact = new Contact();
        contact.setId(id);
        return contact;
    }
}
