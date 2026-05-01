package com.example.SL.Tech.Store.service.impl;

import com.example.SL.Tech.Store.exception.ResourceNotFoundException;
import com.example.SL.Tech.Store.model.Cart;
import com.example.SL.Tech.Store.model.Product;
import com.example.SL.Tech.Store.repository.CartRepository;
import com.example.SL.Tech.Store.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class CartServiceImpl {
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartServiceImpl(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
            return cartRepository.save(cart);
        });
    }

    public Cart addToCart(String userId, String productId, int quantity) {
        Cart cart = getCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        var existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId)).findFirst();
        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + quantity);
        } else {
            Cart.CartItem item = new Cart.CartItem();
            item.setProductId(productId);
            item.setProductName(product.getName());
            item.setProductImage(product.getImages().isEmpty() ? "" : product.getImages().get(0).getUrl());
            item.setPrice(product.getDiscountedPrice());
            item.setQuantity(quantity);
            cart.getItems().add(item);
        }
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart updateCartItem(String userId, String productId, int quantity) {
        Cart cart = getCart(userId);
        cart.getItems().stream().filter(i -> i.getProductId().equals(productId))
                .findFirst().ifPresent(item -> item.setQuantity(quantity));
        cart.getItems().removeIf(i -> i.getQuantity() <= 0);
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart removeFromCart(String userId, String productId) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public void clearCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cart.setUpdatedAt(LocalDateTime.now());
            cartRepository.save(cart);
        });
    }
}
