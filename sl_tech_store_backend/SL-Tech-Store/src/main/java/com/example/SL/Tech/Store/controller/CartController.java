package com.example.SL.Tech.Store.controller;

import com.example.SL.Tech.Store.dto.*;
import com.example.SL.Tech.Store.model.Cart;
import com.example.SL.Tech.Store.service.impl.CartServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartServiceImpl cartService;

    public CartController(CartServiceImpl cartService) { this.cartService = cartService; }

    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(auth.getName())));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Cart>> addToCart(Authentication auth,
            @RequestParam String productId, @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(ApiResponse.success(cartService.addToCart(auth.getName(), productId, quantity)));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Cart>> updateItem(Authentication auth,
            @RequestParam String productId, @RequestParam int quantity) {
        return ResponseEntity.ok(ApiResponse.success(cartService.updateCartItem(auth.getName(), productId, quantity)));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<ApiResponse<Cart>> removeItem(Authentication auth, @PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.success(cartService.removeFromCart(auth.getName(), productId)));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication auth) {
        cartService.clearCart(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
