package com.mindstack.mind_stack_id.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "tbl_quiz_attempt")
public class QuizAttempt {
    @Id
    @Column(name = "attempt_id")
    private long quizAttemptId;

    @Column(name = "quiz_id")
    private long quizId;

    @Column (name ="user_id")
    private long userId;

    @Column(name = "selected_answer")
    private String selectedAnswer;

    @Column(name = "is_correct")
    private boolean isCorrect;

    @Column(name = "attempted_date")
    private LocalDateTime attemptedDate;

    @Column(name = "total_score")
    private int totalScore;

    @Column(name = "study_streak")
    private int studyStreak;

    @PrePersist
    protected void onQuizAttemptDate() {
        this.attemptedDate = LocalDateTime.now();
    }

    public long getQuizAttemptId() {
        return quizAttemptId;
    }

    public void setQuizAttemptId(long quizAttemptId) {
        this.quizAttemptId = quizAttemptId;
    }

    public long getQuizId() {
        return quizId;
    }

    public void setQuizId(long quizId) {
        this.quizId = quizId;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }

    public boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public LocalDateTime getAttemptedDate() {
        return attemptedDate;
    }

    public void setAttemptedDate(LocalDateTime attemptedDate) {
        this.attemptedDate = attemptedDate;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public int getStudyStreak() {
        return studyStreak;
    }

    public void setStudyStreak(int studyStreak) {
        this.studyStreak = studyStreak;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }
}