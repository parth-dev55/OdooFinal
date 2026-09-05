package com.urbanfurniture.accounting.contact.entity;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class Address {

    private String addressLine;
    private String city;
    private String state;
    private String pincode;
}
