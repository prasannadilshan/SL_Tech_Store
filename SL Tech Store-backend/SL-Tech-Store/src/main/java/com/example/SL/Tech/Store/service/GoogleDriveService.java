package com.example.SL.Tech.Store.service;

import com.example.SL.Tech.Store.model.Product;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class GoogleDriveService {

    private final Path uploadDir;

    public GoogleDriveService(@Value("${app.upload.dir:uploads}") String uploadPath) throws IOException {
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath();
        Files.createDirectories(this.uploadDir);
    }

    public Product.ProductImage uploadFile(MultipartFile file) throws IOException {
        String fileId = UUID.randomUUID().toString();
        String ext = "";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = fileId + ext;

        Path target = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // Build URL served by our backend
        String imageUrl = "/api/images/" + fileName;

        Product.ProductImage productImage = new Product.ProductImage();
        productImage.setDriveFileId(fileId);
        productImage.setUrl(imageUrl);
        productImage.setName(originalName != null ? originalName : fileName);
        productImage.setPrimary(false);

        return productImage;
    }

    public void deleteFile(String fileId) throws IOException {
        // Find and delete file with any extension matching this ID
        try (var stream = Files.list(uploadDir)) {
            stream.filter(p -> p.getFileName().toString().startsWith(fileId))
                  .forEach(p -> {
                      try { Files.deleteIfExists(p); } catch (IOException ignored) {}
                  });
        }
    }
}
