package com.example.SL.Tech.Store.service;

import com.example.SL.Tech.Store.model.Product;
import com.google.api.client.http.FileContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;

@Service
public class GoogleDriveService {

    @Value("${app.google-drive.folder-id}")
    private String folderId;

    private final Drive driveService;

    public GoogleDriveService(Drive driveService) {
        this.driveService = driveService;
    }

    public Product.ProductImage uploadFile(MultipartFile file) throws IOException {
        File fileMetadata = new File();
        fileMetadata.setName(file.getOriginalFilename());
        fileMetadata.setParents(Collections.singletonList(folderId));

        java.io.File tempFile = java.io.File.createTempFile("upload-", ".tmp");
        file.transferTo(tempFile);

        FileContent mediaContent = new FileContent(file.getContentType(), tempFile);
        File driveFile = driveService.files().create(fileMetadata, mediaContent)
                .setSupportsAllDrives(true)
                .setFields("id, webViewLink, webContentLink")
                .execute();

        // Make file public
        Permission permission = new Permission()
                .setType("anyone")
                .setRole("reader");
        driveService.permissions().create(driveFile.getId(), permission)
                .setSupportsAllDrives(true)
                .execute();

        // Standard direct link format for Google Drive images (thumbnail is more reliable for direct display)
        String imageUrl = String.format("https://drive.google.com/thumbnail?id=%s&sz=w1000", driveFile.getId());

        Product.ProductImage productImage = new Product.ProductImage();
        productImage.setDriveFileId(driveFile.getId());
        productImage.setUrl(imageUrl);
        productImage.setName(file.getOriginalFilename());
        productImage.setPrimary(false);

        tempFile.delete();
        return productImage;
    }

    public void deleteFile(String fileId) throws IOException {
        driveService.files().delete(fileId)
                .setSupportsAllDrives(true)
                .execute();
    }
}
