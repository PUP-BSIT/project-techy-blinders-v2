package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.Quiz;
import com.mindstack.mind_stack_id.models.dto.CreateQuizSetRequest;
import com.mindstack.mind_stack_id.models.dto.QuizItemRequest;
import com.mindstack.mind_stack_id.models.dto.QuizSetResponse;
import com.mindstack.mind_stack_id.services.QuizService;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    /**
     * Create a new quiz set with quizzes
     * POST /api/quizzes
     */
    @PostMapping
    public ResponseEntity<QuizSetResponse> createQuizSet(
            @RequestBody CreateQuizSetRequest request) {
        try {
            QuizSetResponse response = quizService.createQuizSet(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get quiz set by ID with all its quizzes
     * GET /api/quizzes/id/{id}
     */
    @GetMapping("/id/{id}")
    public ResponseEntity<QuizSetResponse> getQuizSetById(@PathVariable Long id) {
        try {
            QuizSetResponse response = quizService.getQuizSetById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get quiz set by slug with all its quizzes
     * GET /api/quizzes/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<QuizSetResponse> getQuizSetBySlug(@PathVariable String slug) {
        try {
            QuizSetResponse response = quizService.getQuizSetBySlug(slug);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all quiz sets by user ID
     * GET /api/quizzes/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizSetResponse>> getQuizSetsByUserId(
            @PathVariable Long userId) {
        List<QuizSetResponse> responses = quizService.getQuizSetsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get all public quiz sets
     * GET /api/quizzes/public
     */
    @GetMapping("/public")
    public ResponseEntity<List<QuizSetResponse>> getAllPublicQuizSets() {
        List<QuizSetResponse> responses = quizService.getAllPublicQuizSets();
        return ResponseEntity.ok(responses);
    }

    /**
     * Update quiz set
     * PUT /api/quizzes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<QuizSetResponse> updateQuizSet(
            @PathVariable Long id,
            @RequestBody CreateQuizSetRequest request) {
        try {
            QuizSetResponse response = quizService.updateQuizSet(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete quiz set (and all its quizzes)
     * DELETE /api/quizzes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteQuizSet(@PathVariable Long id) {
        try {
            quizService.deleteQuizSet(id);
            return ResponseEntity.ok("Quiz set deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz set not found");
        }
    }

    /**
     * Add a single quiz to an existing set
     * POST /api/quizzes/{quizSetId}/quiz
     */
    @PostMapping("/{quizSetId}/quiz")
    public ResponseEntity<Quiz> addQuizToSet(
            @PathVariable Long quizSetId,
            @RequestBody QuizItemRequest request) {
        try {
            Quiz quiz = quizService.addQuizToSet(quizSetId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(quiz);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Delete a single quiz
     * DELETE /api/quizzes/quiz/{quizId}
     */
    @DeleteMapping("/quiz/{quizId}")
    public ResponseEntity<String> deleteQuiz(@PathVariable Long quizId) {
        try {
            quizService.deleteQuiz(quizId);
            return ResponseEntity.ok("Quiz deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz not found");
        }
    }

}