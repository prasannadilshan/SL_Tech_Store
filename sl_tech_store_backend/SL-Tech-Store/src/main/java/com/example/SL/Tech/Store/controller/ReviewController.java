package com.example.SL.Tech.Store.controller;

import com.example.SL.Tech.Store.dto.ApiResponse;
import com.example.SL.Tech.Store.dto.ReviewRequest;
import com.example.SL.Tech.Store.model.Review;
import com.example.SL.Tech.Store.service.impl.ReviewServiceImpl;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewServiceImpl reviewService;

    public ReviewController(ReviewServiceImpl reviewService) { this.reviewService = reviewService; }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<Review>>> getProductReviews(@PathVariable String productId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviews(productId, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Review>> createReview(Authentication auth, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review submitted", reviewService.createReview(auth.getName(), request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable String id, Authentication auth) {
        reviewService.deleteReview(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
