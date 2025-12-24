package com.mindstack.mind_stack_id.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mindstack.mind_stack_id.models.QuizSet;

@Repository
public interface QuizSetRepository extends JpaRepository<QuizSet, Long> {
    Optional<QuizSet> findBySlugAndIsDeletedFalse(String slug);
    List<QuizSet> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);
    List<QuizSet> findByIsPublicTrueAndIsDeletedFalseOrderByCreatedAtDesc();
    boolean existsBySlug(String slug);
}