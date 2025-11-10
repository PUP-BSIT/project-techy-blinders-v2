package com.mindstack.mind_stack_id.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mindstack.mind_stack_id.Models.QuizCreation;
import java.util.List;



public interface Quiz extends JpaRepository<QuizCreation, Long> {
    List<QuizCreation> findByFlashcardId(long flashcardId);
}
