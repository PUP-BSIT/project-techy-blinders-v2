package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mindstack.mind_stack_id.models.Comment;
import com.mindstack.mind_stack_id.models.dto.CommentDTO;
import com.mindstack.mind_stack_id.services.CommentService;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public List<CommentDTO> getAllComments(@RequestParam(value = "userId", required = false) Long userId) {
        return commentService.getAllComments(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentById(id));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    @GetMapping("/post/{postId}/top-level")
    public ResponseEntity<List<Comment>> getTopLevelCommentsByPostId(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getTopLevelCommentsByPost(postId));
    }

    @GetMapping("/parent/{parentCommentId}")
    public ResponseEntity<List<Comment>> getRepliesByParentComment(@PathVariable Long parentCommentId) {
        return ResponseEntity.ok(commentService.getReplies(parentCommentId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Comment>> getCommentsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(commentService.getCommentsByUser(userId));
    }

    @GetMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<List<Comment>> getCommentsByPostAndUser(@PathVariable Long postId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(commentService.getCommentsByPostAndUser(postId, userId));
    }

    @PostMapping
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment) {
        Comment savedComment = commentService.createComment(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestBody Comment commentDetails) {
        Comment updated = commentService.updateContent(id, commentDetails.getContent());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<CommentDTO> likeComment(@PathVariable Long id,
            @RequestParam(value = "userId", required = false) Long userId) {
        return ResponseEntity.ok(commentService.like(id, userId));
    }

    @PutMapping("/{id}/dislike")
    public ResponseEntity<CommentDTO> dislikeComment(@PathVariable Long id,
            @RequestParam(value = "userId", required = false) Long userId) {
        return ResponseEntity.ok(commentService.dislike(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComment(@PathVariable Long id) {
        commentService.delete(id);
        return ResponseEntity.ok("Comment deleted successfully");
    }

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<CommentCount> getCommentCountByPost(@PathVariable Long postId) {
        long commentCount = commentService.countByPost(postId);
        return ResponseEntity.ok(new CommentCount(postId, commentCount));
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<CommentCount> getCommentCountByUser(@PathVariable Long userId) {
        long commentCount = commentService.countByUser(userId);
        return ResponseEntity.ok(new CommentCount(userId, commentCount));
    }

    @GetMapping("/parent/{parentCommentId}/count")
    public ResponseEntity<CommentCount> getReplyCount(@PathVariable Long parentCommentId) {
        long replyCount = commentService.countReplies(parentCommentId);
        return ResponseEntity.ok(new CommentCount(parentCommentId, replyCount));
    }

    public static class CommentCount {
        private long id;
        private long count;

        public CommentCount(long id, long count) {
            this.id = id;
            this.count = count;
        }

        public long getId() {
            return id;
        }

        public long getCount() {
            return count;
        }
    }
}