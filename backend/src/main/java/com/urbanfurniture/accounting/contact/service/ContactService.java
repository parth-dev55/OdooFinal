package com.urbanfurniture.accounting.contact.service;

import com.urbanfurniture.accounting.common.exception.ResourceNotFoundException;
import com.urbanfurniture.accounting.contact.dto.AddressRequest;
import com.urbanfurniture.accounting.contact.dto.AddressResponse;
import com.urbanfurniture.accounting.contact.dto.ContactResponse;
import com.urbanfurniture.accounting.contact.dto.CreateContactRequest;
import com.urbanfurniture.accounting.contact.dto.UpdateContactRequest;
import com.urbanfurniture.accounting.contact.entity.Address;
import com.urbanfurniture.accounting.contact.entity.Contact;
import com.urbanfurniture.accounting.contact.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;

    @Transactional
    public ContactResponse create(CreateContactRequest request) {
        Contact contact = new Contact();
        contact.setName(request.name().trim());
        contact.setType(request.type());
        contact.setEmail(normalizeEmail(request.email()));
        contact.setMobile(normalizeText(request.mobile()));
        contact.setAddress(toAddress(request.address()));
        contact.setProfileImageUrl(normalizeText(request.profileImageUrl()));
        contact.setActive(request.active() == null || request.active());
        return toResponse(contactRepository.save(contact));
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> findAll() {
        return contactRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ContactResponse findById(Long id) {
        return toResponse(findContact(id));
    }

    @Transactional
    public ContactResponse update(Long id, UpdateContactRequest request) {
        Contact contact = findContact(id);
        if (request.name() != null) contact.setName(request.name().trim());
        if (request.type() != null) contact.setType(request.type());
        if (request.email() != null) contact.setEmail(normalizeEmail(request.email()));
        if (request.mobile() != null) contact.setMobile(normalizeText(request.mobile()));
        if (request.address() != null) contact.setAddress(toAddress(request.address()));
        if (request.profileImageUrl() != null) contact.setProfileImageUrl(normalizeText(request.profileImageUrl()));
        if (request.active() != null) contact.setActive(request.active());
        return toResponse(contactRepository.save(contact));
    }

    @Transactional
    public ContactResponse deactivate(Long id) {
        Contact contact = findContact(id);
        contact.setActive(false);
        return toResponse(contactRepository.save(contact));
    }

    private Contact findContact(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact " + id + " was not found"));
    }

    private Address toAddress(AddressRequest request) {
        if (request == null) return null;
        Address address = new Address();
        address.setAddressLine(normalizeText(request.addressLine()));
        address.setCity(normalizeText(request.city()));
        address.setState(normalizeText(request.state()));
        address.setPincode(normalizeText(request.pincode()));
        return address;
    }

    private String normalizeEmail(String email) {
        String value = normalizeText(email);
        return value == null ? null : value.toLowerCase(Locale.ROOT);
    }

    private String normalizeText(String value) {
        return value == null ? null : value.trim();
    }

    private ContactResponse toResponse(Contact contact) {
        Address address = contact.getAddress();
        AddressResponse addressResponse = address == null ? null : new AddressResponse(
                address.getAddressLine(), address.getCity(), address.getState(), address.getPincode());
        return new ContactResponse(contact.getId(), contact.getName(), contact.getType(), contact.getEmail(),
                contact.getMobile(), addressResponse, contact.getProfileImageUrl(), contact.isActive(),
                contact.getCreatedAt(), contact.getUpdatedAt());
    }
}
