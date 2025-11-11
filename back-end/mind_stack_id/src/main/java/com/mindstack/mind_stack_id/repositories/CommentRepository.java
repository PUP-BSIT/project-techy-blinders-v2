package com.mindstack.mind_stack_id.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.mindstack.mind_stack_id.Models.Comment;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByFlashcardId(long flashcardId);
    List<Comment> findByUserId(long userId);
    List<Comment> findByFlashcardIdAndUserId(long flashcardId, long userId);
    long countByFlashcardId(long flashcardId);
    long countByUserId(long userId);
}