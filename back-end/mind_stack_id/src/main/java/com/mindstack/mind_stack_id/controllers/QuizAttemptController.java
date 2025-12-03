package com.mindstack.mind_stack_id.controllers;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.QuizAttempt;
import com.mindstack.mind_stack_id.models.QuizCreation;
import com.mindstack.mind_stack_id.models.dto.QuizAttemptDTO;
import com.mindstack.mind_stack_id.repositories.QuizAttemptRepository;
import com.mindstack.mind_stack_id.repositories.Quiz;
@RestController
@RequestMapping("/api/quiz_attempts")
public class QuizAttemptController {
    
    @Autowired
    private QuizAttemptRepository attemptRepo;
    
    @Autowired
    private Quiz quizRepo;

    @GetMapping
    public List<QuizAttemptDTO> getAllQuizAttempts() {
        return attemptRepo.findAll()
                .stream()
                .map(f -> new QuizAttemptDTO (
                    f.getQuizId(),
                    f.getQuizAttemptId(),
                    f.getSelectedAnswer(),
                    f.getIsCorrect()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizAttemptById(@PathVariable Long id) {
        Optional<QuizAttempt> attempt = attemptRepo.findById(id);
        
        if (attempt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz attempt not found");
        }
        
        return ResponseEntity.ok(attempt.get());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<?> getAttemptsByQuizId(@PathVariable Long quizId) {
        Optional<QuizCreation> quiz = quizRepo.findById(quizId);
        
        if (quiz.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz not found");
        }
        
        List<QuizAttempt> attempts = attemptRepo.findByQuizId(quizId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAttemptsByUserId(@PathVariable Long userId) {
        List<QuizAttempt> attempts = attemptRepo.findByUserId(userId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/user/{userId}/quiz/{quizId}")
    public ResponseEntity<?> getAttemptsByUserAndQuiz(@PathVariable Long userId, @PathVariable Long quizId) {
        Optional<QuizCreation> quiz = quizRepo.findById(quizId);
        
        if (quiz.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz not found");
        }
        
        List<QuizAttempt> attempts = attemptRepo.findByUserIdAndQuizId(userId, quizId);
        return ResponseEntity.ok(attempts);
    }

    @PostMapping
    public ResponseEntity<?> submitQuizAttempt(@RequestBody QuizAttempt attempt) {
        if (attempt.getUserId() == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("User ID is required");
        }

        if (attempt.getQuizId() == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Quiz ID is required");
        }

        Optional<QuizCreation> quiz = quizRepo.findById(attempt.getQuizId());
        
        if (quiz.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz with ID " + attempt.getQuizId() + " not found");
        }

        if (attempt.getSelectedAnswer() == null || attempt.getSelectedAnswer().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Selected answer is required");
        }

        QuizCreation quizData = quiz.get();
        String correctAnswer = quizData.getCorrectAnswer();

        boolean isCorrect = attempt.getSelectedAnswer().trim()
            .equalsIgnoreCase(correctAnswer.trim());
        
        attempt.setIsCorrect(isCorrect);

        long randomAttemptId = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        attempt.setQuizAttemptId(randomAttemptId);

        if (isCorrect) {
            attempt.setTotalScore(attempt.getTotalScore() + 1);
        }

        QuizAttempt savedAttempt = attemptRepo.save(attempt);

        System.out.println("Quiz attempt submitted:");
        System.out.println("Attempt ID: " + savedAttempt.getQuizAttemptId());
        System.out.println("User ID: " + savedAttempt.getUserId());
        System.out.println("Quiz ID: " + savedAttempt.getQuizId());
        System.out.println("Selected Answer: " + savedAttempt.getSelectedAnswer());
        System.out.println("Is Correct: " + savedAttempt.getIsCorrect());
        System.out.println("Total Score: " + savedAttempt.getTotalScore());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedAttempt);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuizAttempt(@PathVariable Long id, @RequestBody QuizAttempt attemptDetails) {
        Optional<QuizAttempt> existingAttempt = attemptRepo.findById(id);
        
        if (existingAttempt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz attempt not found");
        }
        
        QuizAttempt attempt = existingAttempt.get();
        
        if (attemptDetails.getTotalScore() > 0) {
            attempt.setTotalScore(attemptDetails.getTotalScore());
        }
        if (attemptDetails.getStudyStreak() > 0) {
            attempt.setStudyStreak(attemptDetails.getStudyStreak());
        }
        
        attemptRepo.save(attempt);
        
        System.out.println("Updated quiz attempt with ID: " + id);
        
        return ResponseEntity.ok("Quiz attempt updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuizAttempt(@PathVariable Long id) {
        Optional<QuizAttempt> attempt = attemptRepo.findById(id);
        
        if (attempt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz attempt not found");
        }
        
        attemptRepo.deleteById(id);
        
        System.out.println("Deleted quiz attempt with ID: " + id);
        
        return ResponseEntity.ok("Quiz attempt deleted successfully");
    }

    @GetMapping("/quiz/{quizId}/stats")
    public ResponseEntity<?> getQuizStats(@PathVariable Long quizId) {
        Optional<QuizCreation> quiz = quizRepo.findById(quizId);
        
        if (quiz.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz not found");
        }
        
        List<QuizAttempt> attempts = attemptRepo.findByQuizId(quizId);
        
        long totalAttempts = attempts.size();
        long correctAttempts = attempts.stream().filter(QuizAttempt::getIsCorrect).count();
        double accuracy = totalAttempts > 0 ? (double) correctAttempts / totalAttempts * 100 : 0;
        
        return ResponseEntity.ok(new QuizStats(quizId, totalAttempts, correctAttempts, accuracy));
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable Long userId) {
        List<QuizAttempt> attempts = attemptRepo.findByUserId(userId);
        
        long totalAttempts = attempts.size();
        long correctAttempts = attempts.stream().filter(QuizAttempt::getIsCorrect).count();
        double accuracy = totalAttempts > 0 ? (double) correctAttempts / totalAttempts * 100 : 0;
        int totalScore = attempts.stream().mapToInt(QuizAttempt::getTotalScore).sum();
        
        return ResponseEntity.ok(new UserStats(userId, totalAttempts, correctAttempts, accuracy, totalScore));
    }

    public static class QuizStats {
        private long quizId;
        private long totalAttempts;
        private long correctAttempts;
        private double accuracy;

        public QuizStats(long quizId, long totalAttempts, long correctAttempts, double accuracy) {
            this.quizId = quizId;
            this.totalAttempts = totalAttempts;
            this.correctAttempts = correctAttempts;
            this.accuracy = accuracy;
        }

        public long getQuizId() {
            return quizId;
        }

        public long getTotalAttempts() {
            return totalAttempts;
        }

        public long getCorrectAttempts() {
            return correctAttempts;
        }

        public double getAccuracy() {
            return accuracy;
        }
    }

    public static class UserStats {
        private long userId;
        private long totalAttempts;
        private long correctAttempts;
        private double accuracy;
        private int totalScore;

        public UserStats(long userId, long totalAttempts, long correctAttempts, double accuracy, int totalScore) {
            this.userId = userId;
            this.totalAttempts = totalAttempts;
            this.correctAttempts = correctAttempts;
            this.accuracy = accuracy;
            this.totalScore = totalScore;
        }

        public long getUserId() {
            return userId;
        }

        public long getTotalAttempts() {
            return totalAttempts;
        }

        public long getCorrectAttempts() {
            return correctAttempts;
        }

        public double getAccuracy() {
            return accuracy;
        }

        public int getTotalScore() {
            return totalScore;
        }
    }
}