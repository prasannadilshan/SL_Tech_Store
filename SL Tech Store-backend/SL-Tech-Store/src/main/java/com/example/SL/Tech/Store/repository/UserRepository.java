package com.example.SL.Tech.Store.repository;

import com.example.SL.Tech.Store.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(User.Role role);
}
