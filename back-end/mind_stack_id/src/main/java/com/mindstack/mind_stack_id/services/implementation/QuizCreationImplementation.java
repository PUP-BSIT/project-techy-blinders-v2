package com.mindstack.mind_stack_id.services.implementation;

import com.mindstack.mind_stack_id.services.QuizCreationService;
import com.mindstack.mind_stack_id.repositories.QuizRepository;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom; // ADDED ThreadLocalRandom import
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.mindstack.mind_stack_id.models.QuizCreation;
import com.mindstack.mind_stack_id.models.dto.QuizCreationDTO;

@Service
public class QuizCreationImplementation implements QuizCreationService {
    
    private final QuizRepository quizRepository;

    public QuizCreationImplementation(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    private QuizCreationDTO convertToDto(QuizCreation quiz) {
        return new QuizCreationDTO(
            quiz.getQuizSetId(),
            quiz.getIdentificationAnswer(),
            quiz.getQuestion(),
            quiz.getQuizId(),
            quiz.getUserId()
        );
    }

    @Override
    public List<QuizCreationDTO> getAllQuizzes() {
        return quizRepository.findAll().stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<QuizCreationDTO> getQuizzesByUserId(Long userId) {
        return quizRepository.findByUserId(userId).stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public QuizCreation getQuizById(Long id) {
        return quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));
    }

    @Override
    public QuizCreation getQuizBySlug(String slug) {
        return quizRepository.findBySlug(slug).orElseThrow(() -> new RuntimeException("Quiz not found with slug: " + slug));
    }

    @Override
    public QuizCreation createQuiz(QuizCreation quiz) {
        
        if (quiz.getUserId() == 0) { 
            throw new RuntimeException("User ID is required to associate the quiz.");
        }
        
        validateQuiz(quiz);

        long randomQuizSetId = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        long randomQuizId = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        
        quiz.setQuizId(randomQuizId);
        quiz.setQuizSetId(randomQuizSetId);
        
        String slug = generateSlug(quiz.getQuestion(), randomQuizId); 
        quiz.setSlug(slug);

        if (quiz.getIdentificationAnswer() == null) {
            quiz.setIdentificationAnswer(
                quiz.getQuestionType() == QuizCreation.QuestionType.IDENTIFICATION
            );
        }
        
        System.out.println("Created quiz for User ID: " + quiz.getUserId() 
                            + ", Quiz Set ID: " + quiz.getQuizSetId());
        
        return quizRepository.save(quiz);
    }


    @Override
    public QuizCreation updateQuiz(Long id, QuizCreation quizDetails) {
        QuizCreation quiz = quizRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));

        if (quizDetails.getQuestion() != null) {
            quiz.setQuestion(quizDetails.getQuestion());
            String newSlug = generateSlug(quizDetails.getQuestion(), quiz.getQuizId());
            quiz.setSlug(newSlug);
        }
        if (quizDetails.getUserId() != 0) { 
            quiz.setUserId(quizDetails.getUserId());
        }
        if (quizDetails.getQuestionType() != null) {
            quiz.setQuestionType(quizDetails.getQuestionType());
        }
        return quizRepository.save(quiz);
    }

    @Override
    public void deleteQuiz(Long id) {
        quizRepository.findById(id).orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));
        quizRepository.deleteById(id);
        System.out.println("Deleted quiz with ID: " + id);
    }

    private void validateQuiz(QuizCreation quiz) { /* ... remains the same ... */ }

    private String generateSlug(String question, long quizId) {
        if (question == null || question.trim().isEmpty()) {
            return "quiz-" + quizId;
        }

        String truncatedQuestion = question.length() > 50 
            ? question.substring(0, 50) 
            : question;

        String baseSlug = truncatedQuestion.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");

        if (baseSlug.isEmpty()) {
            baseSlug = "quiz";
        }

        return baseSlug + "-" + quizId;
    }
}