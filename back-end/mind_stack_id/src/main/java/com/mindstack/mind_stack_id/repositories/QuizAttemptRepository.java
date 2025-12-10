package com.mindstack.mind_stack_id.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mindstack.mind_stack_id.models.QuizAttempt;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserId(Long userId);
    List<QuizAttempt> findByQuizSetId(Long quizSetId);
    List<QuizAttempt> findByUserIdAndQuizSetId(Long userId, Long quizSetId);
}