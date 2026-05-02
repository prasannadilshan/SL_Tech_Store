package com.example.SL.Tech.Store.controller;

import com.example.SL.Tech.Store.dto.*;
import com.example.SL.Tech.Store.model.Order;
import com.example.SL.Tech.Store.service.impl.OrderServiceImpl;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderServiceImpl orderService;

    public OrderController(OrderServiceImpl orderService) { this.orderService = orderService; }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(Authentication auth, @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order placed", orderService.createOrder(auth.getName(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getUserOrders(Authentication auth,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(auth.getName(), page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<Page<Order>>> getAllOrders(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) Order.OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(page, size, status)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/user/{userId}")
    public ResponseEntity<ApiResponse<Page<Order>>> getOrdersByUserForAdmin(@PathVariable String userId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrdersForAdmin(userId, page, size)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateStatus(@PathVariable String id, @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateOrderStatus(id, status)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/tracking")
    public ResponseEntity<ApiResponse<Order>> updateTracking(@PathVariable String id, @RequestParam String trackingNumber) {
        return ResponseEntity.ok(ApiResponse.success(orderService.updateTrackingNumber(id, trackingNumber)));
    }
}
