package com.example.SL.Tech.Store.dto;

import com.example.SL.Tech.Store.model.Order;
import com.example.SL.Tech.Store.model.User;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequest> items;

    @NotNull(message = "Shipping address is required")
    private User.Address shippingAddress;

    @NotNull(message = "Delivery option is required")
    private Order.DeliveryOption deliveryOption;

    private String notes;
    private String stripePaymentIntentId;

    @Data
    public static class OrderItemRequest {
        private String productId;
        private int quantity;
    }
}
