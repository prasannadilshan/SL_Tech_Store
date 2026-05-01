package com.example.SL.Tech.Store.repository;

import com.example.SL.Tech.Store.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    Page<ChatMessage> findByRoomIdOrderByTimestampDesc(String roomId, Pageable pageable);
    List<ChatMessage> findByRoomIdAndReadFalseAndSenderIdNot(String roomId, String userId);
    long countByRoomIdAndReadFalseAndSenderIdNot(String roomId, String userId);
}
