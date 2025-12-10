package com.mindstack.mind_stack_id.models.dto;

import java.util.List;
import com.mindstack.mind_stack_id.models.QuizType;

public class CreateQuizSetRequest {
    private Long userId;
    private String title;
    private String description;
    private boolean isPublic;
    private QuizType quizType;
    private List<QuizItemDTO> quizzes;
    
    public CreateQuizSetRequest() {}
    
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
    
    public QuizType getQuizType() {
        return quizType;
    }
    
    public void setQuizType(QuizType quizType) {
        this.quizType = quizType;
    }
    
    public List<QuizItemDTO> getQuizzes() {
        return quizzes;
    }
    
    public void setQuizzes(List<QuizItemDTO> quizzes) {
        this.quizzes = quizzes;
    }
}