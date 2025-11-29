package com.mindstack.mind_stack_id.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mindstack.mind_stack_id.Models.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserId(long userId);
    List<Notification> findByUserIdAndIsReadFalse(long userId);
    List<Notification> findByType(String type);
    List<Notification> findByUserIdAndType(long userId, String type);
    long countByUserIdAndIsReadFalse(long userId);
}