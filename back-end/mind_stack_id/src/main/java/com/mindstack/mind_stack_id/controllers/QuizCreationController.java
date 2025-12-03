package com.mindstack.mind_stack_id.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.QuizCreation;
import com.mindstack.mind_stack_id.models.dto.QuizCreationDTO;
import com.mindstack.mind_stack_id.models.FlashcardCreation;
import com.mindstack.mind_stack_id.repositories.Flashcard;
import com.mindstack.mind_stack_id.repositories.Quiz;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/quiz")
public class QuizCreationController {

    private final Flashcard flashcardRepo;
    private final Quiz quizRepo;

    public QuizCreationController(Flashcard flashcardRepo, Quiz quizRepo) {
        this.flashcardRepo = flashcardRepo;
        this.quizRepo = quizRepo;
    }

    @GetMapping
    public List<QuizCreationDTO> getQuiz() {
        return quizRepo.findAll()
                .stream()
                .map(f -> new QuizCreationDTO (
                    f.getFlashcardId(),
                    f.getIdentifcationAnswer(),
                    f.getQuestion(),
                    f.getQuizId()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id) {
        Optional<QuizCreation> quiz = quizRepo.findById(id);
        
        if (quiz.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz not found");
        }

        System.out.println("Question Type: '" + quiz.get().getQuestionType() + "'");
        
        return ResponseEntity.ok(quiz.get());
    }

    @PostMapping
    public ResponseEntity<?> createQuiz(@RequestBody QuizCreation quiz) {
        if (quiz.getFlashcardId() == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Flashcard ID is required");
        }

        Optional<FlashcardCreation> flashcard = flashcardRepo.findById(quiz.getFlashcardId());
        
        if (flashcard.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Flashcard with ID " + quiz.getFlashcardId() + " not found. Cannot create quiz.");
        }

        if (quiz.getQuestion() == null || quiz.getQuestion().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Question is required");
        }

        if (quiz.getQuestionType() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Question type is required");
        }

        if (quiz.getQuestionType() == QuizCreation.QuestionType.MULTIPLE_CHOICE) {
            if (quiz.getOptionA() == null || quiz.getOptionB() == null || 
                quiz.getOptionC() == null || quiz.getOptionD() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("All options (A, B, C, D) are required for multiple choice questions");
            }
        }

        if (quiz.getCorrectAnswer() == null || quiz.getCorrectAnswer().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Correct answer is required");
        }

        long randomQuizId = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        quiz.setQuizId(randomQuizId);

        if (quiz.getIdentifcationAnswer() == null) {
            quiz.setIdentifcationAnswer(
                quiz.getQuestionType() == QuizCreation.QuestionType.IDENTIFICATION
            );
        }

        QuizCreation savedQuiz = quizRepo.save(quiz);

        System.out.println("Created quiz with ID: " + savedQuiz.getQuizId());
        System.out.println("Associated with Flashcard ID: " + savedQuiz.getFlashcardId());
        System.out.println("Question: " + savedQuiz.getQuestion());
        System.out.println("Question Type: " + savedQuiz.getQuestionType());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedQuiz);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable Long id, @RequestBody QuizCreation quizDetails) {
        Optional<QuizCreation> existingQuiz = quizRepo.findById(id);
        
        if (existingQuiz.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz not found");
        }
        
        QuizCreation quiz = existingQuiz.get();
        
        if (quizDetails.getQuestion() != null) {
            quiz.setQuestion(quizDetails.getQuestion());
        }
        if (quizDetails.getQuestionType() != null) {
            quiz.setQuestionType(quizDetails.getQuestionType());
        }
        if (quizDetails.getOptionA() != null) {
            quiz.setOptionA(quizDetails.getOptionA());
        }
        if (quizDetails.getOptionB() != null) {
            quiz.setOptionB(quizDetails.getOptionB());
        }
        if (quizDetails.getOptionC() != null) {
            quiz.setOptionC(quizDetails.getOptionC());
        }
        if (quizDetails.getOptionD() != null) {
            quiz.setOptionD(quizDetails.getOptionD());
        }
        if (quizDetails.getCorrectAnswer() != null) {
            quiz.setCorrectAnswer(quizDetails.getCorrectAnswer());
        }
        if (quizDetails.getIdentifcationAnswer() != null) {
            quiz.setIdentifcationAnswer(quizDetails.getIdentifcationAnswer());
        }
        
        QuizCreation updatedQuiz = quizRepo.save(quiz);
        
        System.out.println("Updated quiz with ID: " + id);
        
        return ResponseEntity.ok(updatedQuiz);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        Optional<QuizCreation> quiz = quizRepo.findById(id);
        
        if (quiz.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Quiz not found");
        }
        
        quizRepo.deleteById(id);
        
        System.out.println("Deleted quiz with ID: " + id);
        
        return ResponseEntity.ok("Quiz deleted successfully");
    }

    @GetMapping("/flashcard/{flashcardId}")
    public ResponseEntity<?> getQuizzesByFlashcardId(@PathVariable Long flashcardId) {
        Optional<FlashcardCreation> flashcard = flashcardRepo.findById(flashcardId);
        
        if (flashcard.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Flashcard not found");
        }
        
        List<QuizCreation> quizzes = quizRepo.findByFlashcardId(flashcardId);
        
        return ResponseEntity.ok(quizzes);
    }
}