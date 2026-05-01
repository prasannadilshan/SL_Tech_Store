package com.example.SL.Tech.Store.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotBlank(message = "Product ID is required")
    private String productId;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int rating;

    private String title;

    @NotBlank(message = "Comment is required")
    private String comment;
}
