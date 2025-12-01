package com.forgepcp.repository;

import com.forgepcp.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    UserDetails findByLogin(String login);
}
