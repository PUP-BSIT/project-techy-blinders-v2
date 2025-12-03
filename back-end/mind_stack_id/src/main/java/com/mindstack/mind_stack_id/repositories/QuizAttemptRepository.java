package com.mindstack.mind_stack_id.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.mindstack.mind_stack_id.models.QuizAttempt;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizId(long quizId);
    List<QuizAttempt> findByUserId(long userId);
    List<QuizAttempt> findByUserIdAndQuizId(long userId, long quizId);
}