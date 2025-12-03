package com.mindstack.mind_stack_id.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tbl_post")
public class PostCreation {
    public enum CategoryType {
        STUDY_TIPS ("Study Tips"),
        PRODUCT_UPDATES ("Product Updates"),
        LEARNING_STRATEGIES ("Learning Strategies"),
        USER_STORIES ("User Stories"),
        TUTORIALS ("Tutorials"),
        ANNOUNCEMENT ("Announcements"),
        EDUCATIONAL_RESOURCES ("Educational Resources");

        private final String value;

        CategoryType(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static CategoryType fromValue(String input) {
            if (input == null) {
                throw new IllegalArgumentException("Category type cannot be null");
            }

            for (CategoryType type: CategoryType.values()) {
                if(type.name().equalsIgnoreCase(input)) {
                    return type;
                }
            }

            for (CategoryType type: CategoryType.values()) {
                if (type.value.equalsIgnoreCase(input)) {
                    return type;
                }
            }

            throw new IllegalArgumentException(
                "Unknown category type. Accepted values: " +
                "'Study Tips', 'Product Updates', 'Learning Strategies', " +
                "'User Stories', 'Tutorials', 'Announcements', 'Educational Resources'"
            );
        }
    }

    @Id
    @Column(name = "post_id")
    private long postId;

    @Column (name = "user_id")
    private long userId;

    @Column (name = "username")
    private String username;

    @Column (name = "title")
    private String title;

    @Column (name = "content")
    private String content;

    @Column (name = "slug")
    private String slug;

    @Column (name = "category")
    private CategoryType category;

    @Column (name = "is_published")
    private Boolean isPublished;

    @Column (name = "created_at")
    private LocalDateTime createdAt;

    @Column (name = "updated_at")
    private LocalDateTime updatedAt;

    public void setPostId(long postId) {
        this.postId = postId;
    }

    public long getPostId() {
        return postId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }
    
    public long getUserId() {
        return userId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getSlug() {
        return slug;
    }

    public void setCategory (CategoryType category) {
        this.category = category;
    }

    public CategoryType getCategory() {
        return category;
    }

    public void setPublish(Boolean isPublished) {
        this.isPublished = isPublished;
    }

    public Boolean getPublish() {
        return isPublished;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }
}