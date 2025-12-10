package com.mindstack.mind_stack_id.models.dto;

public class QuizAnswerSubmission {
    private Long quizId;
    private String userAnswer;
    
    public QuizAnswerSubmission() {}
    
    public Long getQuizId() {
        return quizId;
    }
    
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    
    public String getUserAnswer() {
        return userAnswer;
    }
    
    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
    }
}