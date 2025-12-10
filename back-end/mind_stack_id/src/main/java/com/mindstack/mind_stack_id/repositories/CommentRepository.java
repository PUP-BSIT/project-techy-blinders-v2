package com.mindstack.mind_stack_id.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.mindstack.mind_stack_id.models.Comment;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(long postId);

    List<Comment> findByUserId(long userId);

    List<Comment> findByPostIdAndUserId(long postId, long userId);

    List<Comment> findByParentCommentId(Long parentCommentId);

    List<Comment> findByPostIdAndParentCommentIdIsNull(long postId);

    long countByPostId(long postId);

    long countByUserId(long userId);

    long countByParentCommentId(Long parentCommentId);
}