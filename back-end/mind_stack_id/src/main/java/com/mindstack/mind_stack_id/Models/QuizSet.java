package com.mindstack.mind_stack_id.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_quiz_set")
public class QuizSet {
    
    @Id
    @Column(name = "quiz_set_id")
    private Long quizSetId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "title", length = 50, nullable = false)
    private String title;
    
    @Column(name = "description", length = 100)
    private String description;
    
    @Column(name = "is_public")
    private boolean isPublic;
    
    @Column(name = "slug", unique = true)
    private String slug;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "quiz_type")
    private QuizType quizType;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "quizSet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Quiz> quizzes = new ArrayList<>();

    @Column(name = "is_deleted")
    private boolean isDeleted = false;
        public boolean isDeleted() {
            return isDeleted;
        }

        public void setDeleted(boolean deleted) {
            isDeleted = deleted;
        }
    
    public QuizSet() {}
    
    public Long getQuizSetId() {
        return quizSetId;
    }
    
    public void setQuizSetId(Long quizSetId) {
        this.quizSetId = quizSetId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public boolean isPublic() {
        return isPublic;
    }
    
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public String getSlug() {
        return slug;
    }
    
    public void setSlug(String slug) {
        this.slug = slug;
    }
    
    public QuizType getQuizType() {
        return quizType;
    }
    
    public void setQuizType(QuizType quizType) {
        this.quizType = quizType;
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
    
    public List<Quiz> getQuizzes() {
        return quizzes;
    }
    
    public void setQuizzes(List<Quiz> quizzes) {
        this.quizzes = quizzes;
    }
    
    // Helper methods
    public void addQuiz(Quiz quiz) {
        quizzes.add(quiz);
        quiz.setQuizSet(this);
    }
    
    public void removeQuiz(Quiz quiz) {
        quizzes.remove(quiz);
        quiz.setQuizSet(null);
    }
}