package com.mindstack.mind_stack_id.models.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

public class PostDTO {
    private long postId;
    private long userId;
    private String title;
    private String username;
    private String content;
    private String slug;
    private String category;
    private Boolean isPublished;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private LocalDateTime updatedAt;
    private Integer commentCount;
    private Boolean showComment;
    private Integer numLike;
    private Integer numDislike;
    private Boolean userLiked;
    private Boolean userDisliked;

    public PostDTO() {
    }

    public PostDTO(long postId, long userId, String title, String username, String content, String slug,
            String category,
            Boolean isPublished, LocalDateTime createdAt, LocalDateTime updatedAt,
            Integer commentCount, Boolean showComment, Integer numLike, Integer numDislike,
            Boolean userLiked, Boolean userDisliked) {
        this.postId = postId;
        this.userId = userId;
        this.title = title;
        this.username = username;
        this.content = content;
        this.slug = slug;
        this.category = category;
        this.isPublished = isPublished;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.commentCount = commentCount;
        this.showComment = showComment;
        this.numLike = numLike;
        this.numDislike = numDislike;
        this.userLiked = userLiked;
        this.userDisliked = userDisliked;
    }

    public long getPostId() {
        return postId;
    }

    public void setPostId(long postId) {
        this.postId = postId;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getIsPublished() {
        return isPublished;
    }

    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(Integer commentCount) {
        this.commentCount = commentCount;
    }

    public Boolean getShowComment() {
        return showComment;
    }

    public void setShowComment(Boolean showComment) {
        this.showComment = showComment;
    }

    public Integer getNumLike() {
        return numLike;
    }

    public void setNumLike(Integer numLike) {
        this.numLike = numLike;
    }

    public Integer getNumDislike() {
        return numDislike;
    }

    public void setNumDislike(Integer numDislike) {
        this.numDislike = numDislike;
    }

    public Boolean getUserLiked() {
        return userLiked;
    }

    public void setUserLiked(Boolean userLiked) {
        this.userLiked = userLiked;
    }

    public Boolean getUserDisliked() {
        return userDisliked;
    }

    public void setUserDisliked(Boolean userDisliked) {
        this.userDisliked = userDisliked;
    }
}