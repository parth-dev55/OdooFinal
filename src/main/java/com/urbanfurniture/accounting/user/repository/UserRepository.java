package com.urbanfurniture.accounting.user.repository;

import com.urbanfurniture.accounting.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmailIgnoreCase(String email);
}
