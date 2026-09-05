package com.urbanfurniture.accounting.contact.controller;

import com.urbanfurniture.accounting.contact.dto.ContactResponse;
import com.urbanfurniture.accounting.contact.dto.CreateContactRequest;
import com.urbanfurniture.accounting.contact.dto.UpdateContactRequest;
import com.urbanfurniture.accounting.contact.service.ContactService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ContactResponse> create(@Valid @RequestBody CreateContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.create(request));
    }

    @GetMapping
    public List<ContactResponse> findAll() {
        return contactService.findAll();
    }

    @GetMapping("/{id}")
    public ContactResponse findById(@PathVariable @Positive Long id) {
        return contactService.findById(id);
    }

    @PutMapping("/{id}")
    public ContactResponse update(@PathVariable @Positive Long id, @Valid @RequestBody UpdateContactRequest request) {
        return contactService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public ContactResponse deactivate(@PathVariable @Positive Long id) {
        return contactService.deactivate(id);
    }
}
