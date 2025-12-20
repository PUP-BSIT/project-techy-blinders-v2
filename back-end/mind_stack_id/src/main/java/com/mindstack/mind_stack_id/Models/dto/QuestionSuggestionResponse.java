package com.mindstack.mind_stack_id.models.dto;

import java.util.List;

public class QuestionSuggestionResponse {
    private List<String> questions;
    
    public QuestionSuggestionResponse(List<String> questions) {
        this.questions = questions;
    }
    
    public List<String> getQuestions() {
        return questions;
    }
}
