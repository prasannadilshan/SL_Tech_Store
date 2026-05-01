package com.example.SL.Tech.Store.dto;

import com.example.SL.Tech.Store.model.User;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String id;
    private String name;
    private String email;
    private String avatar;
    private User.Role role;
}
