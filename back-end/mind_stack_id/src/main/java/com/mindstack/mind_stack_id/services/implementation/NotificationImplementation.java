package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mindstack.mind_stack_id.models.Notification;
import com.mindstack.mind_stack_id.models.dto.NotificationDTO;
import com.mindstack.mind_stack_id.repositories.NotificationRepository;
import com.mindstack.mind_stack_id.services.NotificationService;

@Service
public class NotificationImplementation implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public Notification createNotification(Notification notify) {
        long randomNotifId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);
        notify.setNotifId(randomNotifId);
        notify.setIsCreatedAt(LocalDateTime.now());

        if (notify.getIsRead() == null) {
            notify.setIsRead(false);
        }

        System.out.println("Created notification with ID: " + notify.getNotifId());
        return notificationRepository.save(notify);
    }

    @Override
    public List<NotificationDTO> getAllNotification() {
        return notificationRepository.findAll()
                .stream()
                .map(f -> new NotificationDTO(
                        f.getNotifId(),
                        f.getUserId(),
                        f.getActorUserId(),
                        f.getPostId(),
                        f.getCommentId(),
                        f.getType(),
                        f.getMessage(),
                        f.getIsRead(),
                        f.getIsCreatedAt()))
                .toList();
    }

    @Override
    public Notification getNotifyId(long id) {
        Optional<Notification> notify = notificationRepository.findById(id);
        return notify.orElse(null);
    }

    @Override
    public Notification updateNotification(long id, Notification updatedNotify) {
        Optional<Notification> existingNotify = notificationRepository.findById(id);

        if (existingNotify.isPresent()) {
            Notification notify = existingNotify.get();

            if (updatedNotify.getMessage() != null && !updatedNotify.getMessage().isEmpty()) {
                notify.setMessage(updatedNotify.getMessage());
            }
            if (updatedNotify.getType() != null && !updatedNotify.getType().isEmpty()) {
                notify.setType(updatedNotify.getType());
            }
            if (updatedNotify.getIsRead() != null) {
                notify.setIsRead(updatedNotify.getIsRead());
            }

            return notificationRepository.save(notify);
        }
        return null;
    }

    @Override
    public boolean deleteNotification(long id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<NotificationDTO> getNotificationByUserId(long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(f -> new NotificationDTO(
                        f.getNotifId(),
                        f.getUserId(),
                        f.getActorUserId(),
                        f.getPostId(),
                        f.getCommentId(),
                        f.getType(),
                        f.getMessage(),
                        f.getIsRead(),
                        f.getIsCreatedAt()))
                .toList();
    }

    @Override
    @Transactional
    public boolean markAsRead(long id) {
        int updated = notificationRepository.markAsReadById(id);
        if (updated > 0) {
            return true;
        }

        Optional<Notification> notify = notificationRepository.findById(id);
        if (notify.isPresent()) {
            Notification notification = notify.get();
            notification.setIsRead(true);
            notificationRepository.save(notification);
            return true;
        }
        return false;
    }
}