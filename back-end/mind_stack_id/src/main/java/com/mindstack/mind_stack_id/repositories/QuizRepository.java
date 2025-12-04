package com.mindstack.mind_stack_id.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mindstack.mind_stack_id.models.QuizCreation;
import java.util.List;
import java.util.Optional;


public interface QuizRepository extends JpaRepository<QuizCreation, Long> {
    List<QuizCreation> findByQuizSetId(long quizSetId);
    List<QuizCreation> findByUserId(long userId);
    Optional<QuizCreation> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
