package com.example.SL.Tech.Store.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String userEmail;
    private String userName;

    private List<OrderItem> items = new ArrayList<>();

    private User.Address shippingAddress;

    private DeliveryOption deliveryOption;

    private double subtotal;
    private double deliveryFee;
    private double totalAmount;

    private OrderStatus status = OrderStatus.PENDING;

    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    private String stripePaymentIntentId;
    private String stripeSessionId;

    private String trackingNumber;
    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    private LocalDateTime deliveredAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productName;
        private String productImage;
        private double price;
        private int quantity;
        private double subtotal;
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    }

    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED
    }

    @Getter
    public enum DeliveryOption {
        EXPRESS("Express Delivery", 500.00, "1-2 business days"),
        STORE_PICKUP("Store Pickup", 0.00, "Same day");

        private final String label;
        private final double fee;
        private final String estimatedTime;

        DeliveryOption(String label, double fee, String estimatedTime) {
            this.label = label;
            this.fee = fee;
            this.estimatedTime = estimatedTime;
        }
    }
}
