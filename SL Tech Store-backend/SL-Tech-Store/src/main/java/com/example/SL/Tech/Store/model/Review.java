package com.example.SL.Tech.Store.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
@CompoundIndex(name = "user_product_idx", def = "{'userId': 1, 'productId': 1}", unique = true)
public class Review {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String userName;
    private String userAvatar;

    @Indexed
    private String productId;

    private int rating; // 1-5

    private String title;
    private String comment;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
