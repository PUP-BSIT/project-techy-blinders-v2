package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.time.ZoneId;
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
        // Ensure timestamps are recorded in Asia/Manila regardless of server timezone
        notify.setIsCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));

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

    @Override
    @Transactional
    public void deletePostReactionNotifications(Long actorUserId, Long postId) {
        if (actorUserId == null || postId == null)
            return;
        List<String> types = List.of("POST_LIKE", "POST_DISLIKE");
        notificationRepository.deleteByActorAndPostAndTypes(actorUserId, postId, types);
    }

    @Override
    @Transactional
    public void deleteCommentReactionNotifications(Long actorUserId, Long commentId) {
        if (actorUserId == null || commentId == null)
            return;
        List<String> types = List.of("COMMENT_LIKE", "COMMENT_DISLIKE");
        notificationRepository.deleteByActorAndCommentAndTypes(actorUserId, commentId, types);
    }

    @Override
    @Transactional
    public void deleteCommentReplyNotifications(Long actorUserId, Long parentCommentId) {
        if (actorUserId == null || parentCommentId == null)
            return;
        List<String> types = List.of("COMMENT_REPLY");
        notificationRepository.deleteByActorAndCommentAndTypes(actorUserId, parentCommentId, types);
    }

    @Override
    @Transactional
    public void deletePostCommentNotifications(Long actorUserId, Long postId) {
        if (actorUserId == null || postId == null)
            return;
        List<String> types = List.of("POST_COMMENT");
        notificationRepository.deleteByActorAndPostAndTypes(actorUserId, postId, types);
    }

    @Override
    @Transactional
    public void deleteNotificationsForPost(Long postId) {
        if (postId == null)
            return;
        notificationRepository.deleteByPostId(postId);
    }

    @Override
    @Transactional
    public void deleteNotificationsForComment(Long commentId) {
        if (commentId == null)
            return;
        notificationRepository.deleteByCommentId(commentId);
    }
}