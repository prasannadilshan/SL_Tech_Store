package com.example.SL.Tech.Store.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @TextIndexed
    private String name;

    @Indexed
    private String brand;

    private String model;

    @TextIndexed
    private String description;

    private double price;

    private double discount; // percentage

    private int stock;

    @Indexed
    private String category; // Gaming, Business, Ultrabook, Budget, Workstation

    private ProductSpecs specs;

    private List<ProductImage> images = new ArrayList<>();

    private double rating;

    private int reviewCount;

    private boolean featured;

    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSpecs {
        private String processor;
        private String ram;
        private String storage;
        private String gpu;
        private String display;
        private String battery;
        private String os;
        private String weight;
        private String color;
        private String ports;
        private String wireless;
        private String keyboard;
        private String webcam;
        private String warranty;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductImage {
        private String driveFileId;
        private String url;
        private String name;
        private boolean isPrimary;
    }

    public double getDiscountedPrice() {
        if (discount > 0) {
            return price - (price * discount / 100);
        }
        return price;
    }
}
