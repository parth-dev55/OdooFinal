package com.urbanfurniture.accounting.user.service;

import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.contact.repository.ContactRepository;
import com.urbanfurniture.accounting.common.exception.DuplicateResourceException;
import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.user.dto.CreateUserRequest;
import com.urbanfurniture.accounting.user.dto.UpdateUserRequest;
import com.urbanfurniture.accounting.user.dto.UserResponse;
import com.urbanfurniture.accounting.user.entity.User;
import com.urbanfurniture.accounting.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = normalizeEmail(request.email());
        ensureEmailAvailable(email);

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setRole(request.role());
        user.setActive(request.active() == null || request.active());
        user.setContact(contact(request.contactId()));
        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = findUser(id);

        if (request.name() != null) {
            user.setName(request.name().trim());
        }
        if (request.email() != null) {
            String email = normalizeEmail(request.email());
            if (!user.getEmail().equalsIgnoreCase(email)) {
                ensureEmailAvailable(email);
                user.setEmail(email);
            }
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.active() != null) {
            user.setActive(request.active());
        }
        if (request.contactId() != null) {
            user.setContact(contact(request.contactId()));
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse deactivate(Long id) {
        User user = findUser(id);
        user.setActive(false);
        return toResponse(userRepository.save(user));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User " + id + " was not found"));
    }

    private void ensureEmailAvailable(String email) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("Email is already in use");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private Contact contact(Long id) {
        if (id == null) {
            return null;
        }
        return contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact " + id + " was not found"));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive(),
                user.getFirebaseUid(), user.getContact() == null ? null : user.getContact().getId(),
                user.getCreatedAt(), user.getUpdatedAt());
    }
}
