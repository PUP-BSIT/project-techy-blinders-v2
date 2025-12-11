package com.mindstack.mind_stack_id.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mindstack.mind_stack_id.models.PostReaction;
import com.mindstack.mind_stack_id.models.PostReactionId;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReaction, PostReactionId> {
    Optional<PostReaction> findByPostIdAndUserId(long postId, long userId);
}
