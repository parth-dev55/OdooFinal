package com.urbanfurniture.accounting.contact.repository;

import com.urbanfurniture.accounting.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}
