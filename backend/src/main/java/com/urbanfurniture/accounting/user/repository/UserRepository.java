package com.urbanfurniture.accounting.user.repository;

import com.urbanfurniture.accounting.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByFirebaseUid(String firebaseUid);
}
