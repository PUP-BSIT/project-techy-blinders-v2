package com.mindstack.mind_stack_id.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mindstack.mind_stack_id.models.FlashcardCreation;

public interface Flashcard extends JpaRepository<FlashcardCreation, Long> {
    List<FlashcardCreation> findByUserId(Long userId);
}