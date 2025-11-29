package com.mindstack.mind_stack_id.Models.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private long notificationId;
    private long userId;
    private String type;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDTO(){}

    public NotificationDTO(long notificationId, long userId, String type, String message, boolean isRead, LocalDateTime createdAt) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public long getNotifId() {
        return notificationId;
    }

    public void setNotifId(long notificationId) {
        this.notificationId = notificationId;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getType(){
        return type;
    }

    public void setIsRead(boolean isRead) {
        this.isRead = isRead;
    }

    public boolean getIsRead() {
        return isRead;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }
}