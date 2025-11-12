package com.mindstack.mind_stack_id.Models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "tbl_rating")
public class Rating {
    @Id
    @Column(name = "rating_id")
    private long ratingId;

    @Column(name = "comment_id")
    private long commentId;

    @Column(name = "user_id")
    private long userId;

    @Column(name = "rating_value")
    private int ratingValue;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onRatingDate() {
        this.createdAt = LocalDateTime.now();
    }

    public long getRatingId() {
        return ratingId;
    }

    public void setRatingId(long ratingId){
        this.ratingId = ratingId;
    }

    public long getCommentId() {
        return commentId;
    }

    public void setCommentId(long commentId) {
        this.commentId = commentId;
    }

    public long getUserId(){
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public long getRatingValue() {
        return ratingValue;
    }

    public void setRatingValue(int ratingValue) {
        this.ratingValue = ratingValue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
