package com.example.SL.Tech.Store.service.impl;

import com.example.SL.Tech.Store.dto.ProductRequest;
import com.example.SL.Tech.Store.exception.ResourceNotFoundException;
import com.example.SL.Tech.Store.model.Product;
import com.example.SL.Tech.Store.repository.ProductRepository;
import com.example.SL.Tech.Store.service.GoogleDriveService;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductServiceImpl {
    private final ProductRepository productRepository;
    private final GoogleDriveService googleDriveService;

    public ProductServiceImpl(ProductRepository productRepository, GoogleDriveService googleDriveService) {
        this.productRepository = productRepository;
        this.googleDriveService = googleDriveService;
    }

    public Product createProduct(ProductRequest request) {
        Product product = new Product();
        mapRequestToProduct(request, product);
        product.setCreatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product updateProduct(String id, ProductRequest request) {
        Product product = getProductById(id);
        mapRequestToProduct(request, product);
        product.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(product);
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public Page<Product> getProducts(int page, int size, String sortBy, String sortDir,
                                      String brand, String category, Double minPrice, Double maxPrice, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        if (search != null && !search.isEmpty()) return productRepository.searchByText(search, pageable);
        if (brand != null && category != null) return productRepository.findByActiveTrueAndBrandAndCategory(brand, category, pageable);
        if (brand != null) return productRepository.findByActiveTrueAndBrand(brand, pageable);
        if (category != null) return productRepository.findByActiveTrueAndCategory(category, pageable);
        if (minPrice != null && maxPrice != null) return productRepository.findByActiveTrueAndPriceBetween(minPrice, maxPrice, pageable);
        return productRepository.findByActiveTrue(pageable);
    }

    public List<Product> getFeaturedProducts() { return productRepository.findByActiveTrueAndFeaturedTrue(); }
    public List<Product> getLatestProducts() { return productRepository.findTop8ByActiveTrueOrderByCreatedAtDesc(); }
    public List<Product> getTopRatedProducts() { return productRepository.findTop8ByActiveTrueOrderByRatingDesc(); }

    public Product addProductImage(String productId, MultipartFile file, boolean isPrimary) throws IOException {
        Product product = getProductById(productId);
        Product.ProductImage image = googleDriveService.uploadFile(file);
        image.setPrimary(isPrimary);
        if (isPrimary) product.getImages().forEach(img -> img.setPrimary(false));
        product.getImages().add(image);
        return productRepository.save(product);
    }

    public Product removeProductImage(String productId, String driveFileId) throws IOException {
        Product product = getProductById(productId);
        googleDriveService.deleteFile(driveFileId);
        product.getImages().removeIf(img -> img.getDriveFileId().equals(driveFileId));
        return productRepository.save(product);
    }

    public void deleteProduct(String id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    public long getProductCount() { return productRepository.countByActiveTrue(); }
    public long getOutOfStockCount() { return productRepository.countByActiveTrueAndStock(0); }
    public long getLowStockCount() { return productRepository.countByActiveTrueAndStockLessThan(5); }

    private void mapRequestToProduct(ProductRequest request, Product product) {
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setModel(request.getModel());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscount(request.getDiscount());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setSpecs(request.getSpecs());
        product.setFeatured(request.isFeatured());
        product.setActive(request.isActive());
    }
}
