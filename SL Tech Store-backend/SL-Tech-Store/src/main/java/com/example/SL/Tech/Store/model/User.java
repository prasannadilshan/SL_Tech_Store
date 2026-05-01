package com.example.SL.Tech.Store.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String avatar;

    private String phone;

    private String googleId;

    private Role role = Role.USER;

    private List<Address> addresses = new ArrayList<>();

    private List<String> wishlist = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum Role {
        USER, ADMIN
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String id;
        private String fullName;
        private String phone;
        private String street;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private boolean isDefault;
    }
}
