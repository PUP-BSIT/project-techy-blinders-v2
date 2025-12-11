package com.mindstack.mind_stack_id.services;

import java.util.List;

import com.mindstack.mind_stack_id.models.Comment;
import com.mindstack.mind_stack_id.models.dto.CommentDTO;

public interface CommentService {
    List<CommentDTO> getAllComments(Long userId);

    Comment getCommentById(long id);

    List<Comment> getCommentsByPost(long postId);

    List<Comment> getTopLevelCommentsByPost(long postId);

    List<Comment> getReplies(long parentCommentId);

    List<Comment> getCommentsByUser(long userId);

    List<Comment> getCommentsByPostAndUser(long postId, long userId);

    Comment createComment(Comment comment);

    Comment updateContent(long id, String content);

    CommentDTO like(long id, Long userId);

    CommentDTO dislike(long id, Long userId);

    void delete(long id);

    long countByPost(long postId);

    long countByUser(long userId);

    long countReplies(long parentCommentId);
}
