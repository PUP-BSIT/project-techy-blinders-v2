package com.mindstack.mind_stack_id.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mindstack.mind_stack_id.models.CommentReaction;
import com.mindstack.mind_stack_id.models.CommentReactionId;

import java.util.List;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, CommentReactionId> {
    Optional<CommentReaction> findByCommentIdAndUserId(long commentId, long userId);

    List<CommentReaction> findByCommentId(long commentId);
}
