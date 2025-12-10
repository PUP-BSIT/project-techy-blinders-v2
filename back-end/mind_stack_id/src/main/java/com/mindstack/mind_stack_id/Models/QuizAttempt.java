package com.mindstack.mind_stack_id.models;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_quiz_attempt")
public class QuizAttempt {
    
    @Id
    @Column(name = "attempt_id")
    private Long attemptId;
    
    @Column(name = "quiz_set_id", nullable = false)
    private Long quizSetId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "attempted_date")
    private LocalDateTime attemptedDate;
    
    @Column(name = "total_score")
    private Integer totalScore;
    
    public QuizAttempt() {}
    
    public Long getAttemptId() {
        return attemptId;
    }
    
    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }
    
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
    
    public LocalDateTime getAttemptedDate() {
        return attemptedDate;
    }
    
    public void setAttemptedDate(LocalDateTime attemptedDate) {
        this.attemptedDate = attemptedDate;
    }
    
    public Integer getTotalScore() {
        return totalScore;
    }
    
    public void setTotalScore(Integer totalScore) {
        this.totalScore = totalScore;
    }
}