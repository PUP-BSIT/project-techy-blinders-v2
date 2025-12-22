package com.mindstack.mind_stack_id.services;

import java.util.List;

import com.mindstack.mind_stack_id.models.Notification;
import com.mindstack.mind_stack_id.models.dto.NotificationDTO;

public interface NotificationService {
    Notification createNotification(Notification notify);

    List<NotificationDTO> getAllNotification();

    Notification getNotifyId(long id);

    Notification updateNotification(long id, Notification updateNotify);

    boolean deleteNotification(long id);

    List<NotificationDTO> getNotificationByUserId(long userId);

    boolean markAsRead(long id);

    void deletePostReactionNotifications(Long actorUserId, Long postId);

    void deleteCommentReactionNotifications(Long actorUserId, Long commentId);

    void deleteNotificationsForPost(Long postId);

    void deleteNotificationsForComment(Long commentId);

    void deleteCommentReplyNotifications(Long actorUserId, Long parentCommentId);

    void deletePostCommentNotifications(Long actorUserId, Long postId);
}
