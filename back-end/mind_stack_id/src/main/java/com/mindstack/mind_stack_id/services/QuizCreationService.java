package com.mindstack.mind_stack_id.services;

import java.util.List;
import com.mindstack.mind_stack_id.models.QuizCreation;
import com.mindstack.mind_stack_id.models.dto.QuizCreationDTO;

public interface QuizCreationService {
    List<QuizCreationDTO> getAllQuizzes();
    List<QuizCreationDTO> getQuizzesByUserId(Long userId);
    QuizCreation getQuizById(Long id);
    QuizCreation getQuizBySlug(String slug);
    QuizCreation createQuiz(QuizCreation quiz);
    QuizCreation updateQuiz(Long id, QuizCreation quizDetails);
    void deleteQuiz(Long id);
}