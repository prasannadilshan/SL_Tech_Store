package com.example.SL.Tech.Store.repository;

import com.example.SL.Tech.Store.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByActiveTrueAndBrand(String brand, Pageable pageable);

    Page<Product> findByActiveTrueAndCategory(String category, Pageable pageable);

    Page<Product> findByActiveTrueAndBrandAndCategory(String brand, String category, Pageable pageable);

    @Query("{ 'active': true, 'price': { $gte: ?0, $lte: ?1 } }")
    Page<Product> findByActiveTrueAndPriceBetween(double minPrice, double maxPrice, Pageable pageable);

    @Query("{ 'active': true, $text: { $search: ?0 } }")
    Page<Product> searchByText(String query, Pageable pageable);

    List<Product> findByActiveTrueAndFeaturedTrue();

    @Query("{ 'active': true, 'brand': { $in: ?0 } }")
    Page<Product> findByActiveTrueAndBrandIn(List<String> brands, Pageable pageable);

    long countByActiveTrue();

    List<Product> findTop8ByActiveTrueOrderByCreatedAtDesc();

    List<Product> findTop8ByActiveTrueOrderByRatingDesc();
}
