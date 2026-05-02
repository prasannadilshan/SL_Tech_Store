package com.example.SL.Tech.Store.controller;

import com.example.SL.Tech.Store.dto.ApiResponse;
import com.example.SL.Tech.Store.dto.ChatMessageDto;
import com.example.SL.Tech.Store.model.ChatMessage;
import com.example.SL.Tech.Store.model.ChatRoom;
import com.example.SL.Tech.Store.service.ChatService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/room")
    public ResponseEntity<ApiResponse<ChatRoom>> getMyRoom(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getOrCreateRoom(auth.getName())));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<ChatRoom>>> getAllRooms() {
        return ResponseEntity.ok(ApiResponse.success(chatService.getAllRooms()));
    }

    @GetMapping("/room/{roomId}/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessage>>> getMessages(@PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getRoomMessages(roomId, page, size)));
    }

    @PostMapping("/room/{roomId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String roomId, Authentication auth) {
        chatService.markAsRead(roomId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDto dto, Authentication auth) {
        ChatMessage message = chatService.sendMessage(dto.getRoomId(), auth.getName(), dto.getContent(), dto.getType());
        messagingTemplate.convertAndSend("/topic/chat/" + dto.getRoomId(), message);
    }

    @PostMapping("/room/{roomId}/send")
    public ResponseEntity<ApiResponse<ChatMessage>> sendRestMessage(@PathVariable String roomId, @RequestBody ChatMessageDto dto, Authentication auth) {
        ChatMessage message = chatService.sendMessage(roomId, auth.getName(), dto.getContent(), dto.getType());
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
