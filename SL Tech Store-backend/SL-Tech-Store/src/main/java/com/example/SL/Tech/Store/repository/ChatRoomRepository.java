package com.example.SL.Tech.Store.repository;

import com.example.SL.Tech.Store.model.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    Optional<ChatRoom> findByUserId(String userId);
    List<ChatRoom> findByAdminIdOrderByLastMessageAtDesc(String adminId);
    List<ChatRoom> findByStatusOrderByLastMessageAtDesc(ChatRoom.RoomStatus status);
    List<ChatRoom> findAllByOrderByLastMessageAtDesc();
}
