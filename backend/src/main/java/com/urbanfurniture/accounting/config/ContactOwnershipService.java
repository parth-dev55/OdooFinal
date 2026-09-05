package com.urbanfurniture.accounting.config;

import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.user.entity.User;
import com.urbanfurniture.accounting.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactOwnershipService {

    private final UserRepository users;

    public boolean isContactUser(Authentication authentication) {
        return authentication != null
                && (authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_CONTACT_USER".equals(authority.getAuthority())
                        || "ROLE_CUSTOMER".equals(authority.getAuthority())));
    }

    public void requireOwner(Authentication authentication, Contact contact) {
        if (!isContactUser(authentication)) {
            return;
        }
        User user = users.findByFirebaseUid(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Contact ownership could not be verified"));
        if (user.getContact() == null || !user.getContact().getId().equals(contact.getId())) {
            throw new AccessDeniedException("You are not authorized to access this contact record");
        }
    }

    public boolean owns(Authentication authentication, Contact contact) {
        if (!isContactUser(authentication)) {
            return true;
        }
        User user = users.findByFirebaseUid(authentication.getName()).orElse(null);
        return user != null && user.getContact() != null
                && user.getContact().getId().equals(contact.getId());
    }
}
