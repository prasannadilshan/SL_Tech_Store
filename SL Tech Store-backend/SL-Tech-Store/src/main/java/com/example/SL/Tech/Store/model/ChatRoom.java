package com.example.SL.Tech.Store.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_rooms")
public class ChatRoom {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String userName;
    private String userAvatar;

    private String adminId;

    private RoomStatus status = RoomStatus.ACTIVE;

    private String lastMessage;
    private LocalDateTime lastMessageAt;

    private int unreadCount;

    private LocalDateTime createdAt;

    public enum RoomStatus {
        ACTIVE, CLOSED
    }
}
