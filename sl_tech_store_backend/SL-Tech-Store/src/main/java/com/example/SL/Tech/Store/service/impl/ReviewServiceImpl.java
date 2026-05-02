package com.example.SL.Tech.Store.service.impl;

import com.example.SL.Tech.Store.dto.ReviewRequest;
import com.example.SL.Tech.Store.exception.ResourceNotFoundException;
import com.example.SL.Tech.Store.model.Product;
import com.example.SL.Tech.Store.model.Review;
import com.example.SL.Tech.Store.model.User;
import com.example.SL.Tech.Store.repository.ProductRepository;
import com.example.SL.Tech.Store.repository.ReviewRepository;
import com.example.SL.Tech.Store.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class ReviewServiceImpl {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final com.example.SL.Tech.Store.repository.OrderRepository orderRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository, ProductRepository productRepository,
                             UserRepository userRepository, com.example.SL.Tech.Store.repository.OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public Review createReview(String userId, ReviewRequest request) {
        if (reviewRepository.findByUserIdAndProductId(userId, request.getProductId()).isPresent()) {
            throw new IllegalArgumentException("You have already reviewed this product");
        }
        
        boolean hasPurchased = orderRepository.existsByUserIdAndItems_ProductIdAndStatus(userId, request.getProductId(), com.example.SL.Tech.Store.model.Order.OrderStatus.DELIVERED);
        if (!hasPurchased) {
            throw new IllegalArgumentException("You can only review products that have been delivered to you.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Review review = new Review();
        review.setUserId(userId);
        review.setUserName(user.getName());
        review.setUserAvatar(user.getAvatar());
        review.setProductId(request.getProductId());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        updateProductRating(request.getProductId());
        return saved;
    }

    public Page<Review> getProductReviews(String productId, int page, int size) {
        return reviewRepository.findByProductId(productId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public void deleteReview(String reviewId, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (!review.getUserId().equals(userId)) throw new IllegalArgumentException("Cannot delete another user's review");
        reviewRepository.delete(review);
        updateProductRating(review.getProductId());
    }

    private void updateProductRating(String productId) {
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setRating(avgRating != null ? avgRating : 0);
            product.setReviewCount((int) count);
            productRepository.save(product);
        }
    }
}
