package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.dto.QuizAttemptResponse;
import com.mindstack.mind_stack_id.models.dto.SubmitQuizAttemptRequest;
import com.mindstack.mind_stack_id.services.QuizAttemptService;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptService quizAttemptService;

    /**
     * Submit quiz attempt and get results with score
     * POST /api/quiz-attempts
     * 
     * Request body example:
     * {
     *   "userId": 12345,
     *   "quizSetId": 1234567890,
     *   "answers": [
     *     {
     *       "quizId": 9876543210,
     *       "userAnswer": "C"
     *     },
     *     {
     *       "quizId": 9876543211,
     *       "userAnswer": "Java Virtual Machine"
     *     }
     *   ]
     * }
     */
    @PostMapping
    public ResponseEntity<QuizAttemptResponse> submitQuizAttempt(
            @RequestBody SubmitQuizAttemptRequest request) {
        try {
            QuizAttemptResponse response = quizAttemptService.submitQuizAttempt(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get quiz attempt by ID with full results
     * GET /api/quiz-attempts/id/{id}
     */
    @GetMapping("/id/{id}")
    public ResponseEntity<QuizAttemptResponse> getQuizAttemptById(@PathVariable Long id) {
        try {
            QuizAttemptResponse response = quizAttemptService.getQuizAttemptById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all quiz attempts by user
     * GET /api/quiz-attempts/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizAttemptResponse>> getQuizAttemptsByUserId(
            @PathVariable Long userId) {
        List<QuizAttemptResponse> responses = quizAttemptService.getQuizAttemptsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get all attempts for a specific quiz set
     * GET /api/quiz-attempts/quiz-set/{quizSetId}
     */
    @GetMapping("/quiz-set/{quizSetId}")
    public ResponseEntity<List<QuizAttemptResponse>> getQuizAttemptsByQuizSetId(
            @PathVariable Long quizSetId) {
        List<QuizAttemptResponse> responses = quizAttemptService.getQuizAttemptsByQuizSetId(quizSetId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get user's attempts for a specific quiz set
     * GET /api/quiz-attempts/user/{userId}/quiz-set/{quizSetId}
     */
    @GetMapping("/user/{userId}/quiz-set/{quizSetId}")
    public ResponseEntity<List<QuizAttemptResponse>> getQuizAttemptsByUserAndQuizSet(
            @PathVariable Long userId,
            @PathVariable Long quizSetId) {
        List<QuizAttemptResponse> responses = quizAttemptService.getQuizAttemptsByUserAndQuizSet(userId, quizSetId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Delete quiz attempt
     * DELETE /api/quiz-attempts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteQuizAttempt(@PathVariable Long id) {
        try {
            quizAttemptService.deleteQuizAttempt(id);
            return ResponseEntity.ok("Quiz attempt deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz attempt not found");
        }
    }
}