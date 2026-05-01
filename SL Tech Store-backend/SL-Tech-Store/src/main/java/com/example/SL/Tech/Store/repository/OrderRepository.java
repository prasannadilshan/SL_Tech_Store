package com.example.SL.Tech.Store.repository;

import com.example.SL.Tech.Store.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<Order, String> {
    Page<Order> findByUserId(String userId, Pageable pageable);
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    Optional<Order> findByStripeSessionId(String sessionId);
    long countByStatus(Order.OrderStatus status);
}
