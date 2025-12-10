package com.mindstack.mind_stack_id.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.mindstack.mind_stack_id.models.FlashcardSet;

@Repository
public interface FlashcardSetRepository extends JpaRepository<FlashcardSet, Long> {
    Optional<FlashcardSet> findBySlug(String slug);
    List<FlashcardSet> findByUserId(Long userId);
    List<FlashcardSet> findByIsPublicTrue();
    boolean existsBySlug(String slug);
}