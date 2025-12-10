package com.mindstack.mind_stack_id.services.implementation;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.mindstack.mind_stack_id.models.Comment;
import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.models.dto.CommentDTO;
import com.mindstack.mind_stack_id.repositories.CommentRepository;
import com.mindstack.mind_stack_id.repositories.PostRepository;
import com.mindstack.mind_stack_id.repositories.UserRepository;
import com.mindstack.mind_stack_id.services.CommentService;

@Service
public class CommentImplementation implements CommentService {

    private final CommentRepository commentRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;

    public CommentImplementation(CommentRepository commentRepo, PostRepository postRepo, UserRepository userRepo) {
        this.commentRepo = commentRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
    }

    @Override
    public List<CommentDTO> getAllComments() {
        return commentRepo.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public Comment getCommentById(long id) {
        return commentRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }

    @Override
    public List<Comment> getCommentsByPost(long postId) {
        ensurePostExists(postId);
        return commentRepo.findByPostId(postId);
    }

    @Override
    public List<Comment> getTopLevelCommentsByPost(long postId) {
        ensurePostExists(postId);
        return commentRepo.findByPostIdAndParentCommentIdIsNull(postId);
    }

    @Override
    public List<Comment> getReplies(long parentCommentId) {
        ensureCommentExists(parentCommentId);
        return commentRepo.findByParentCommentId(parentCommentId);
    }

    @Override
    public List<Comment> getCommentsByUser(long userId) {
        ensureUserExists(userId);
        return commentRepo.findByUserId(userId);
    }

    @Override
    public List<Comment> getCommentsByPostAndUser(long postId, long userId) {
        ensurePostExists(postId);
        ensureUserExists(userId);
        return commentRepo.findByPostIdAndUserId(postId, userId);
    }

    @Override
    public Comment createComment(Comment comment) {
        validateRequiredIds(comment);

        User user = ensureUserExists(comment.getUserId());
        ensurePostExists(comment.getPostId());

        if (isBlank(comment.getContent())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment content is required");
        }

        if (comment.getParentCommentId() != null) {
            ensureCommentExists(comment.getParentCommentId());
        }

        if (isBlank(comment.getUsername())) {
            comment.setUsername(user.getUsername());
        }

        long randomCommentId = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        comment.setCommentId(randomCommentId);

        return commentRepo.save(comment);
    }

    @Override
    public Comment updateContent(long id, String content) {
        if (isBlank(content)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment content cannot be empty");
        }

        Comment existing = getCommentById(id);
        existing.setContent(content);
        return commentRepo.save(existing);
    }

    @Override
    public Comment like(long id) {
        Comment existing = getCommentById(id);
        existing.setNumLike(existing.getNumLike() + 1);
        return commentRepo.save(existing);
    }

    @Override
    public Comment dislike(long id) {
        Comment existing = getCommentById(id);
        existing.setNumDislike(existing.getNumDislike() + 1);
        return commentRepo.save(existing);
    }

    @Override
    public void delete(long id) {
        ensureCommentExists(id);
        commentRepo.deleteById(id);
    }

    @Override
    public long countByPost(long postId) {
        ensurePostExists(postId);
        return commentRepo.countByPostId(postId);
    }

    @Override
    public long countByUser(long userId) {
        ensureUserExists(userId);
        return commentRepo.countByUserId(userId);
    }

    @Override
    public long countReplies(long parentCommentId) {
        ensureCommentExists(parentCommentId);
        return commentRepo.countByParentCommentId(parentCommentId);
    }

    private CommentDTO mapToDto(Comment comment) {
        return new CommentDTO(
                comment.getCommentId(),
                comment.getUserId(),
                comment.getPostId(),
                comment.getUsername(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                comment.getNumLike(),
                comment.getNumDislike(),
                comment.getParentCommentId());
    }

    private User ensureUserExists(long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private PostCreation ensurePostExists(long postId) {
        return postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    private Comment ensureCommentExists(long commentId) {
        return commentRepo.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }

    private void validateRequiredIds(Comment comment) {
        if (comment.getUserId() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }

        if (comment.getPostId() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post ID is required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
