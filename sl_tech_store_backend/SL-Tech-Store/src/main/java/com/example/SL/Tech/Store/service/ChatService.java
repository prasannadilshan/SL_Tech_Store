package com.example.SL.Tech.Store.service;

import com.example.SL.Tech.Store.model.ChatMessage;
import com.example.SL.Tech.Store.model.ChatRoom;
import com.example.SL.Tech.Store.model.User;
import com.example.SL.Tech.Store.repository.ChatMessageRepository;
import com.example.SL.Tech.Store.repository.ChatRoomRepository;
import com.example.SL.Tech.Store.repository.UserRepository;
import com.example.SL.Tech.Store.exception.ResourceNotFoundException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatService(ChatRoomRepository chatRoomRepository, ChatMessageRepository chatMessageRepository,
                       UserRepository userRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    public ChatRoom getOrCreateRoom(String userId) {
        return chatRoomRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
            ChatRoom room = new ChatRoom();
            room.setUserId(userId);
            room.setUserName(user.getName());
            room.setUserAvatar(user.getAvatar());
            room.setCreatedAt(LocalDateTime.now());
            return chatRoomRepository.save(room);
        });
    }

    public ChatMessage sendMessage(String roomId, String senderId, String content, String type) {
        User sender = userRepository.findById(senderId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

        ChatMessage message = new ChatMessage();
        message.setRoomId(roomId);
        message.setSenderId(senderId);
        message.setSenderName(sender.getName());
        message.setSenderRole(sender.getRole().name());
        message.setContent(content);
        message.setType(type != null ? ChatMessage.MessageType.valueOf(type) : ChatMessage.MessageType.TEXT);
        message.setTimestamp(LocalDateTime.now());

        room.setLastMessage(content);
        room.setLastMessageAt(LocalDateTime.now());
        room.setUnreadCount(room.getUnreadCount() + 1);
        chatRoomRepository.save(room);

        return chatMessageRepository.save(message);
    }

    public Page<ChatMessage> getRoomMessages(String roomId, int page, int size) {
        return chatMessageRepository.findByRoomIdOrderByTimestampDesc(roomId, PageRequest.of(page, size));
    }

    public List<ChatRoom> getAllRooms() { return chatRoomRepository.findAllByOrderByLastMessageAtDesc(); }

    public void markAsRead(String roomId, String userId) {
        List<ChatMessage> unread = chatMessageRepository.findByRoomIdAndReadFalseAndSenderIdNot(roomId, userId);
        unread.forEach(m -> m.setRead(true));
        chatMessageRepository.saveAll(unread);
        chatRoomRepository.findById(roomId).ifPresent(room -> { room.setUnreadCount(0); chatRoomRepository.save(room); });
    }
}
