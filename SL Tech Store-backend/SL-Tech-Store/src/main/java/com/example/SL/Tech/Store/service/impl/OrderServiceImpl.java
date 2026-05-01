package com.example.SL.Tech.Store.service.impl;

import com.example.SL.Tech.Store.dto.OrderRequest;
import com.example.SL.Tech.Store.exception.ResourceNotFoundException;
import com.example.SL.Tech.Store.model.Order;
import com.example.SL.Tech.Store.model.Product;
import com.example.SL.Tech.Store.model.User;
import com.example.SL.Tech.Store.repository.OrderRepository;
import com.example.SL.Tech.Store.repository.ProductRepository;
import com.example.SL.Tech.Store.repository.UserRepository;
import com.example.SL.Tech.Store.service.EmailService;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartServiceImpl cartService;
    private final EmailService emailService;

    public OrderServiceImpl(OrderRepository orderRepository, ProductRepository productRepository,
                            UserRepository userRepository, CartServiceImpl cartService, EmailService emailService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
        this.emailService = emailService;
    }

    public Order createOrder(String userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = new Order();
        order.setUserId(userId);
        order.setUserEmail(user.getEmail());
        order.setUserName(user.getName());
        order.setShippingAddress(request.getShippingAddress());
        order.setDeliveryOption(request.getDeliveryOption());
        order.setNotes(request.getNotes());
        order.setStripePaymentIntentId(request.getStripePaymentIntentId());

        List<Order.OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0;

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
            if (product.getStock() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for: " + product.getName());
            }

            Order.OrderItem orderItem = new Order.OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setProductImage(product.getImages().isEmpty() ? "" : product.getImages().get(0).getUrl());
            orderItem.setPrice(product.getDiscountedPrice());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setSubtotal(product.getDiscountedPrice() * itemReq.getQuantity());
            subtotal += orderItem.getSubtotal();
            orderItems.add(orderItem);

            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);
        }

        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(request.getDeliveryOption().getFee());
        order.setTotalAmount(subtotal + request.getDeliveryOption().getFee());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(request.getStripePaymentIntentId() != null ? Order.PaymentStatus.PAID : Order.PaymentStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(userId);
        emailService.sendOrderConfirmation(user.getEmail(), user.getName(), savedOrder.getId(), savedOrder.getTotalAmount());
        return savedOrder;
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    public Page<Order> getUserOrders(String userId, int page, int size) {
        return orderRepository.findByUserId(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public Page<Order> getAllOrders(int page, int size, Order.OrderStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null) return orderRepository.findByStatus(status, pageable);
        return orderRepository.findAll(pageable);
    }

    public Order updateOrderStatus(String orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        if (status == Order.OrderStatus.DELIVERED) order.setDeliveredAt(LocalDateTime.now());
        Order saved = orderRepository.save(order);
        emailService.sendOrderStatusUpdate(order.getUserEmail(), order.getUserName(), orderId, status.name());
        return saved;
    }

    public Order updateTrackingNumber(String orderId, String trackingNumber) {
        Order order = getOrderById(orderId);
        order.setTrackingNumber(trackingNumber);
        return orderRepository.save(order);
    }

    public long getOrderCount() { return orderRepository.count(); }
    public long getPendingOrderCount() { return orderRepository.countByStatus(Order.OrderStatus.PENDING); }
}
