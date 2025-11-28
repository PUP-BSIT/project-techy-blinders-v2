package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mindstack.mind_stack_id.Models.Notification;
import com.mindstack.mind_stack_id.Models.dto.NotificationDTO;
import com.mindstack.mind_stack_id.repositories.NotificationRepository;
import com.mindstack.mind_stack_id.services.NotificationService;

@Service
public class NotificationImplementation implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public Notification createNotification(Notification notification) {
        long randomNotificationId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);
        notification.setNotificationId(randomNotificationId);
        
        notification.setCreatedAt(LocalDateTime.now());
        
        if (notification.getIsRead() == null) {
            notification.setIsRead(false);
        }
        
        System.out.println("Created notification with ID: " + notification.getNotificationId());
        
        return notificationRepository.save(notification);
    }

    @Override
    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(n -> new NotificationDTO(
                        n.getNotificationId(),
                        n.getUserId(),
                        n.getType(),
                        n.getIsRead(),
                        n.getMessage(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public Notification getNotificationById(long id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        return notification.orElse(null);
    }

    @Override
    public List<NotificationDTO> getNotificationByUserId(long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(n -> new NotificationDTO(
                        n.getNotificationId(),
                        n.getUserId(),
                        n.getType(),
                        n.getIsRead(),
                        n.getMessage(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public List<NotificationDTO> getNotificationUnreadByUser(long userId) {
        return notificationRepository.findByUserIdAndIsRead(userId, false)
                .stream()
                .map(n -> new NotificationDTO(
                        n.getNotificationId(),
                        n.getUserId(),
                        n.getType(),
                        n.getIsRead(),
                        n.getMessage(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public Notification markAsRead(long id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        if (notification.isPresent()) {
            Notification readNotification = notification.get();
            readNotification.setIsRead(true);
            
            System.out.println("Marked notification as read with ID: " + readNotification.getNotificationId());
            
            return notificationRepository.save(readNotification);
        }
        
        System.out.println("Notification not found: " + id);
        return null;
    }

    @Override
    public boolean deleteNotification(long id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        if (notification.isPresent()) {
            notificationRepository.deleteById(id);
            System.out.println("Deleted notification with ID: " + id);
            return true;
        }
        
        System.out.println("Notification not found: " + id);
        return false;
    }
}