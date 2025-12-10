package com.mindstack.mind_stack_id.models.dto;

import java.util.List;

public class SubmitQuizAttemptRequest {
    private Long userId;
    private Long quizSetId;
    private List<QuizAnswerSubmission> answers;
    
    public SubmitQuizAttemptRequest() {}
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getQuizSetId() {
        return quizSetId;
    }
    
    public void setQuizSetId(Long quizSetId) {
        this.quizSetId = quizSetId;
    }
    
    public List<QuizAnswerSubmission> getAnswers() {
        return answers;
    }
    
    public void setAnswers(List<QuizAnswerSubmission> answers) {
        this.answers = answers;
    }
}