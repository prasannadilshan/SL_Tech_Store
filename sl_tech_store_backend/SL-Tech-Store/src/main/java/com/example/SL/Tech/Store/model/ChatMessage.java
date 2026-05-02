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
@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;

    @Indexed
    private String roomId;

    private String senderId;
    private String senderName;
    private String senderRole;

    private String content;

    private MessageType type = MessageType.TEXT;

    private boolean read;

    private LocalDateTime timestamp;

    public enum MessageType {
        TEXT, IMAGE, SYSTEM
    }
}
