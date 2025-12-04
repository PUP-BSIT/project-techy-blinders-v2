package com.mindstack.mind_stack_id.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.QuizCreation;
import com.mindstack.mind_stack_id.models.dto.QuizCreationDTO;
import com.mindstack.mind_stack_id.services.QuizCreationService;
import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizCreationController {
    
    private final QuizCreationService quizCreationService;

    public QuizCreationController(QuizCreationService quizCreationService) {
        this.quizCreationService = quizCreationService;
    }

    @GetMapping
    public ResponseEntity<List<QuizCreationDTO>> getAllQuizzes() {
        return ResponseEntity.ok(quizCreationService.getAllQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizCreation> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizCreationService.getQuizById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<QuizCreation> getQuizBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(quizCreationService.getQuizBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<QuizCreation> createQuiz(@RequestBody QuizCreation quiz) {
        QuizCreation createdQuiz = quizCreationService.createQuiz(quiz);
        return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizCreation> updateQuiz(@PathVariable Long id, @RequestBody QuizCreation quizDetails) {
        QuizCreation updatedQuiz = quizCreationService.updateQuiz(id, quizDetails);
        return ResponseEntity.ok(updatedQuiz);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizCreationService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }
}