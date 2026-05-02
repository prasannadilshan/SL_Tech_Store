package com.example.SL.Tech.Store.controller;

import com.example.SL.Tech.Store.dto.*;
import com.example.SL.Tech.Store.model.Product;
import com.example.SL.Tech.Store.service.impl.ProductServiceImpl;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductServiceImpl productService;

    public ProductController(ProductServiceImpl productService) { this.productService = productService; }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getProducts(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy, @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String brand, @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice, @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProducts(page, size, sortBy, sortDir, brand, category, minPrice, maxPrice, search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<Product>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts()));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<Product>>> getLatest() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLatestProducts()));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<ApiResponse<List<Product>>> getTopRated() {
        return ResponseEntity.ok(ApiResponse.success(productService.getTopRatedProducts()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product created", productService.createProduct(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable String id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<Product>> uploadImage(@PathVariable String id, @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(productService.addProductImage(id, file, isPrimary)));
    }

    @DeleteMapping("/{id}/images/{driveFileId}")
    public ResponseEntity<ApiResponse<Product>> deleteImage(@PathVariable String id, @PathVariable String driveFileId) throws IOException {
        return ResponseEntity.ok(ApiResponse.success(productService.removeProductImage(id, driveFileId)));
    }
}
