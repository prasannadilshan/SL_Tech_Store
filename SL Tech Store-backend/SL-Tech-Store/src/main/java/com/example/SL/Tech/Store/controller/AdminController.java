package com.example.SL.Tech.Store.controller;

import com.example.SL.Tech.Store.dto.ApiResponse;
import com.example.SL.Tech.Store.service.impl.OrderServiceImpl;
import com.example.SL.Tech.Store.service.impl.ProductServiceImpl;
import com.example.SL.Tech.Store.service.impl.UserServiceImpl;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final OrderServiceImpl orderService;
    private final ProductServiceImpl productService;
    private final UserServiceImpl userService;

    public AdminController(OrderServiceImpl orderService, ProductServiceImpl productService, UserServiceImpl userService) {
        this.orderService = orderService;
        this.productService = productService;
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productService.getProductCount());
        stats.put("totalOrders", orderService.getOrderCount());
        stats.put("pendingOrders", orderService.getPendingOrderCount());
        stats.put("totalUsers", userService.getAllUsers().size());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
