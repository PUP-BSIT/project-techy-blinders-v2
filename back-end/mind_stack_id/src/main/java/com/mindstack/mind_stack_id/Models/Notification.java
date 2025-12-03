package com.mindstack.mind_stack_id.models;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_notification")
public class Notification {
    
    @Id
    @Column(name = "notification_id")
    private Long notifId;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "type")
    private String type;
    
    @Column(name = "message")
    private String message;
    
    @Column(name = "is_read")
    private Boolean isRead;
    
    @Column(name = "created_at")
    private LocalDateTime isCreatedAt;

    public Notification() {}

    public Notification(Long notifId, Long userId, String type, String message, Boolean isRead, LocalDateTime isCreatedAt) {
        this.notifId = notifId;
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.isRead = isRead;
        this.isCreatedAt = isCreatedAt;
    }

    public Long getNotifId() {
        return notifId;
    }

    public void setNotifId(Long notifId) {
        this.notifId = notifId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setIsMessage(String message) {
        this.message = message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getIsCreatedAt() {
        return isCreatedAt;
    }

    public void setIsCreatedAt(LocalDateTime isCreatedAt) {
        this.isCreatedAt = isCreatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return isCreatedAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.isCreatedAt = createdAt;
    }
}