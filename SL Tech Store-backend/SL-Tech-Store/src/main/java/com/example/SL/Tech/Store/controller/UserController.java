package com.example.SL.Tech.Store.controller;

import com.example.SL.Tech.Store.dto.ApiResponse;
import com.example.SL.Tech.Store.model.User;
import com.example.SL.Tech.Store.service.impl.UserServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserServiceImpl userService;

    public UserController(UserServiceImpl userService) { this.userService = userService; }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(auth.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(Authentication auth, @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(auth.getName(), name, phone)));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<User>> addAddress(Authentication auth, @RequestBody User.Address address) {
        return ResponseEntity.ok(ApiResponse.success(userService.addAddress(auth.getName(), address)));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<User>> removeAddress(Authentication auth, @PathVariable String addressId) {
        return ResponseEntity.ok(ApiResponse.success(userService.removeAddress(auth.getName(), addressId)));
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<User>> updateAddress(Authentication auth, @PathVariable String addressId, @RequestBody User.Address address) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateAddress(auth.getName(), addressId, address)));
    }

    @PostMapping("/payment-methods")
    public ResponseEntity<ApiResponse<User>> addPaymentMethod(Authentication auth, @RequestBody User.SavedPaymentMethod paymentMethod) {
        return ResponseEntity.ok(ApiResponse.success(userService.addPaymentMethod(auth.getName(), paymentMethod)));
    }

    @DeleteMapping("/payment-methods/{methodId}")
    public ResponseEntity<ApiResponse<User>> removePaymentMethod(Authentication auth, @PathVariable String methodId) {
        return ResponseEntity.ok(ApiResponse.success(userService.removePaymentMethod(auth.getName(), methodId)));
    }

    @GetMapping("/wishlist")
    public ResponseEntity<ApiResponse<List<com.example.SL.Tech.Store.model.Product>>> getWishlist(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(userService.getWishlistProducts(auth.getName())));
    }

    @PostMapping("/wishlist/{productId}")
    public ResponseEntity<ApiResponse<User>> addToWishlist(Authentication auth, @PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.success(userService.addToWishlist(auth.getName(), productId)));
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<ApiResponse<User>> removeFromWishlist(Authentication auth, @PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.success(userService.removeFromWishlist(auth.getName(), productId)));
    }

    @PostMapping("/ping")
    public ResponseEntity<ApiResponse<Void>> ping(Authentication auth) {
        userService.pingUser(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Ping successful", null));
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<java.time.LocalDateTime>> getUserStatus(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserLastSeen(userId)));
    }

    @GetMapping("/admin/status")
    public ResponseEntity<ApiResponse<java.time.LocalDateTime>> getAdminStatus() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAdminLastSeen()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{userId}/role")
    public ResponseEntity<ApiResponse<User>> updateRole(@PathVariable String userId, @RequestParam User.Role role) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserRole(userId, role)));
    }
}
