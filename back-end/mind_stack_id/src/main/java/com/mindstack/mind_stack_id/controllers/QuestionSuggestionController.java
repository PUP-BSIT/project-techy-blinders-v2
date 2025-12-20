package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mindstack.mind_stack_id.models.dto.QuestionRequest;
import com.mindstack.mind_stack_id.models.dto.QuestionSuggestionResponse;
import com.mindstack.mind_stack_id.services.QuestionSuggestionService;

@RestController
@RequestMapping("/api/suggestions")
public class QuestionSuggestionController {
   
    private final QuestionSuggestionService service;
    
    public QuestionSuggestionController(QuestionSuggestionService service) {
        this.service = service;
    }
    
    @PostMapping("/questions")
    public QuestionSuggestionResponse generateQuestions(@RequestBody QuestionRequest request) {
        List<String> questions = service.generateQuestions(request.getTitle(), request.getDescription());
        return new QuestionSuggestionResponse(questions);
    }
}
