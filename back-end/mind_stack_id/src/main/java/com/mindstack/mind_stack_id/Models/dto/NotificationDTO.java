package com.mindstack.mind_stack_id.models.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private long notificationId;
    private long userId;
    private Long actorUserId;
    private Long postId;
    private Long commentId;
    private String type;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDTO() {
    }

    public NotificationDTO(long notificationId, long userId, Long actorUserId, Long postId, Long commentId, String type,
            String message, boolean isRead, LocalDateTime createdAt) {
        this.notificationId = notificationId;
        this.userId = userId;
        this.actorUserId = actorUserId;
        this.postId = postId;
        this.commentId = commentId;
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

    public Long getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(Long actorUserId) {
        this.actorUserId = actorUserId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getType() {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}