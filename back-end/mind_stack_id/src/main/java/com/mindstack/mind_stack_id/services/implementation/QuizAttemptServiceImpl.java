package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mindstack.mind_stack_id.models.Quiz;
import com.mindstack.mind_stack_id.models.QuizAttempt;
import com.mindstack.mind_stack_id.models.QuizSet;
import com.mindstack.mind_stack_id.models.dto.QuizAnswerSubmission;
import com.mindstack.mind_stack_id.models.dto.QuizAttemptResponse;
import com.mindstack.mind_stack_id.models.dto.QuizResultDTO;
import com.mindstack.mind_stack_id.models.dto.SubmitQuizAttemptRequest;
import com.mindstack.mind_stack_id.repositories.QuizAttemptRepository;
import com.mindstack.mind_stack_id.repositories.QuizSetRepository;
import com.mindstack.mind_stack_id.services.QuizAttemptService;

@Service
public class QuizAttemptServiceImpl implements QuizAttemptService {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private QuizSetRepository quizSetRepository;


    @Override
    public QuizAttemptResponse getQuizAttemptById(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Quiz attempt not found with id: " + attemptId));
        
        QuizSet quizSet = quizSetRepository.findById(attempt.getQuizSetId())
            .orElseThrow(() -> new RuntimeException("Quiz set not found with id: " + attempt.getQuizSetId()));
        
        List<QuizResultDTO> results = new ArrayList<>();
        
        int maxScore = quizSet.getQuizzes().stream()
            .mapToInt(this::getQuizPoints)
            .sum();
        
        return buildResponse(attempt, quizSet, results, maxScore);
    }

    @Override
    public List<QuizAttemptResponse> getQuizAttemptsByUserId(Long userId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserId(userId);
        
        return attempts.stream()
            .map(attempt -> getQuizAttemptById(attempt.getAttemptId()))
            .collect(Collectors.toList());
    }

    @Override
    public List<QuizAttemptResponse> getQuizAttemptsByQuizSetId(Long quizSetId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizSetId(quizSetId);
        
        return attempts.stream()
            .map(attempt -> getQuizAttemptById(attempt.getAttemptId()))
            .collect(Collectors.toList());
    }

    @Override
    public List<QuizAttemptResponse> getQuizAttemptsByUserAndQuizSet(Long userId, Long quizSetId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndQuizSetId(userId, quizSetId);
        
        return attempts.stream()
            .map(attempt -> getQuizAttemptById(attempt.getAttemptId()))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteQuizAttempt(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Quiz attempt not found with id: " + attemptId));
        
        quizAttemptRepository.delete(attempt);
        
        System.out.println("Deleted quiz attempt with ID: " + attemptId);
    }

    // Helper methods
    private String getCorrectAnswer(Quiz quiz) {
        if (quiz.getQuizType() == null) {
            return null;
        }
        
        switch (quiz.getQuizType()) {
            case multiple_choice:
                return quiz.getCorrectAnswer();
            case identification_answer:
                return quiz.getIdentificationAnswer();
            default:
                return null;
        }
    }
    
    private boolean checkAnswer(String userAnswer, String correctAnswer, Quiz quiz) {
        if (userAnswer == null || correctAnswer == null || userAnswer.trim().isEmpty()) {
            return false;
        }
        
        return userAnswer.trim().equalsIgnoreCase(correctAnswer.trim());
    }
    
    private int getQuizPoints(Quiz quiz) {
        try {
            Integer points = quiz.getPoints();
            return points != null ? points : 1;
        } catch (Exception e) {
            return 1;
        }
    }
    
    private QuizAttemptResponse buildResponse(QuizAttempt attempt, QuizSet quizSet, 
                                             List<QuizResultDTO> results, int maxScore) {
        QuizAttemptResponse response = new QuizAttemptResponse();
        response.setAttemptId(attempt.getAttemptId());
        response.setQuizSetId(attempt.getQuizSetId());
        response.setUserId(attempt.getUserId());
        response.setQuizSetTitle(quizSet.getTitle());
        response.setAttemptedDate(attempt.getAttemptedDate());
        response.setTotalScore(attempt.getTotalScore());
        response.setMaxScore(maxScore);
        
        double percentage = maxScore > 0 ? (attempt.getTotalScore() * 100.0 / maxScore) : 0.0;
        response.setPercentage(Math.round(percentage * 100.0) / 100.0); // Round to 2 decimals
        
        response.setResults(results);
        
        return response;
    }

    public QuizAttemptResponse submitQuizAttempt(SubmitQuizAttemptRequest request) {
    System.out.println("=== Starting Quiz Attempt Submission ===");
    System.out.println("User ID: " + request.getUserId());
    System.out.println("Quiz Set ID: " + request.getQuizSetId());
    System.out.println("Number of answers: " + (request.getAnswers() != null ? request.getAnswers().size() : "null"));
    
    try {
        long attemptId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);
        System.out.println("Generated Attempt ID: " + attemptId);
        
        // Get the quiz set with all quizzes
        System.out.println("Fetching quiz set...");
        QuizSet quizSet = quizSetRepository.findById(request.getQuizSetId())
            .orElseThrow(() -> new RuntimeException("Quiz set not found with id: " + request.getQuizSetId()));
        System.out.println("Quiz set found: " + quizSet.getTitle());
        System.out.println("Number of quizzes in set: " + (quizSet.getQuizzes() != null ? quizSet.getQuizzes().size() : "null"));
        
        if (quizSet.getQuizzes() == null) {
            throw new RuntimeException("Quiz set has no quizzes loaded");
        }
        
        System.out.println("Creating user answers map...");
        Map<Long, String> userAnswersMap = request.getAnswers().stream()
            .collect(Collectors.toMap(
                QuizAnswerSubmission::getQuizId,
                QuizAnswerSubmission::getUserAnswer
            ));
        System.out.println("User answers map created with " + userAnswersMap.size() + " entries");
        
        // Grade each quiz and calculate score
        System.out.println("Grading quizzes...");
        List<QuizResultDTO> results = new ArrayList<>();
        int totalScore = 0;
        int maxScore = 0;
        
        for (Quiz quiz : quizSet.getQuizzes()) {
            System.out.println("Processing quiz ID: " + quiz.getQuizId());
            String userAnswer = userAnswersMap.getOrDefault(quiz.getQuizId(), "");
            String correctAnswer = getCorrectAnswer(quiz);
            System.out.println("User answer: '" + userAnswer + "', Correct answer: '" + correctAnswer + "'");
            
            boolean isCorrect = checkAnswer(userAnswer, correctAnswer, quiz);
            int points = getQuizPoints(quiz);
            
            System.out.println("Is correct: " + isCorrect + ", Points: " + points);
            
            results.add(new QuizResultDTO(
                quiz.getQuizId(),
                quiz.getQuestion(),
                userAnswer,
                correctAnswer,
                isCorrect,
                isCorrect ? points : 0
            ));
            
            if (isCorrect) {
                totalScore += points;
            }
            maxScore += points;
        }
        
        System.out.println("Total score: " + totalScore + "/" + maxScore);
        
        System.out.println("Creating quiz attempt entity...");
        QuizAttempt attempt = new QuizAttempt();
        attempt.setAttemptId(attemptId);
        attempt.setQuizSetId(request.getQuizSetId());
        attempt.setUserId(request.getUserId());
        attempt.setAttemptedDate(LocalDateTime.now());
        attempt.setTotalScore(totalScore);
        
        System.out.println("Saving quiz attempt to database...");
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
        
        System.out.println("Quiz attempt saved successfully with ID: " + savedAttempt.getAttemptId());
        
        System.out.println("Building response...");
        QuizAttemptResponse response = buildResponse(savedAttempt, quizSet, results, maxScore);
        System.out.println("=== Quiz Attempt Submission Completed Successfully ===");
        
        return response;
        
    } catch (Exception e) {
        System.err.println("=== ERROR in submitQuizAttempt ===");
        System.err.println("Error type: " + e.getClass().getName());
        System.err.println("Error message: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to submit quiz attempt: " + e.getMessage(), e);
    }
    }
}