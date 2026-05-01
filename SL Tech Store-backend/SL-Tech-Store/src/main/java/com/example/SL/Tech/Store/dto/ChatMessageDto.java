package com.example.SL.Tech.Store.dto;

import lombok.Data;

@Data
public class ChatMessageDto {
    private String roomId;
    private String content;
    private String type; // TEXT, IMAGE
}
