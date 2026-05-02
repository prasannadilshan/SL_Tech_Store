package com.example.SL.Tech.Store.dto;

import com.example.SL.Tech.Store.model.Product;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Brand is required")
    private String brand;

    private String model;

    private String description;

    @Positive(message = "Price must be positive")
    private double price;

    @PositiveOrZero(message = "Discount cannot be negative")
    private double discount;

    @PositiveOrZero(message = "Stock cannot be negative")
    private int stock;

    @NotBlank(message = "Category is required")
    private String category;

    private Product.ProductSpecs specs;

    private boolean featured;
    private boolean active = true;
}
