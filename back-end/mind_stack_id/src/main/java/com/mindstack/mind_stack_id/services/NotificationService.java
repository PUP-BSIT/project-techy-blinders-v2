package com.mindstack.mind_stack_id.services;

import java.util.List;

import com.mindstack.mind_stack_id.Models.Notification;
import com.mindstack.mind_stack_id.Models.dto.NotificationDTO;

public interface NotificationService {
    Notification createNotification(Notification notify);
    List<NotificationDTO> getAllNotification();
    Notification getNotifyId(long id);
    Notification updateNotification(long id, Notification updateNotify);
    boolean deleteNotification(long id);
    List<NotificationDTO> getNotificationByUserId(long userId);
    boolean markAsRead(long id);
}
