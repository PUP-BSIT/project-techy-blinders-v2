package com.mindstack.mind_stack_id.services;

import java.util.List;
import com.mindstack.mind_stack_id.models.Quiz;
import com.mindstack.mind_stack_id.models.dto.CreateQuizSetRequest;
import com.mindstack.mind_stack_id.models.dto.QuizItemRequest;
import com.mindstack.mind_stack_id.models.dto.QuizSetResponse;

public interface QuizService {
    
    QuizSetResponse createQuizSet(CreateQuizSetRequest request);
    QuizSetResponse getQuizSetById(Long quizSetId);
    QuizSetResponse getQuizSetBySlug(String slug);
    List<QuizSetResponse> getQuizSetsByUserId(Long userId);
    List<QuizSetResponse> getAllPublicQuizSets();
    QuizSetResponse updateQuizSet(Long quizSetId, CreateQuizSetRequest request);
    void deleteQuizSet(Long quizSetId);
    
    Quiz addQuizToSet(Long quizSetId, QuizItemRequest quizRequest);
    void deleteQuiz(Long quizId);
}