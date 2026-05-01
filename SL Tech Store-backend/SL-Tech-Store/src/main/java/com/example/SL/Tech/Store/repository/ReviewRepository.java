package com.example.SL.Tech.Store.repository;

import com.example.SL.Tech.Store.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Aggregation;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {
    Page<Review> findByProductId(String productId, Pageable pageable);
    Optional<Review> findByUserIdAndProductId(String userId, String productId);
    long countByProductId(String productId);

    @Aggregation(pipeline = {
        "{ $match: { 'productId': ?0 } }",
        "{ $group: { _id: null, avgRating: { $avg: '$rating' } } }"
    })
    Double getAverageRatingByProductId(String productId);
}
