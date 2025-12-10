package com.mindstack.mind_stack_id.services;

import java.util.List;
import com.mindstack.mind_stack_id.models.dto.QuizAttemptResponse;
import com.mindstack.mind_stack_id.models.dto.SubmitQuizAttemptRequest;

public interface QuizAttemptService {
    QuizAttemptResponse submitQuizAttempt(SubmitQuizAttemptRequest request);
    QuizAttemptResponse getQuizAttemptById(Long attemptId);
    List<QuizAttemptResponse> getQuizAttemptsByUserId(Long userId);
    List<QuizAttemptResponse> getQuizAttemptsByQuizSetId(Long quizSetId);
    List<QuizAttemptResponse> getQuizAttemptsByUserAndQuizSet(Long userId, Long quizSetId);
    void deleteQuizAttempt(Long attemptId);
}