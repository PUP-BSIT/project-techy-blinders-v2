package com.mindstack.mind_stack_id.services.implementation;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.mindstack.mind_stack_id.models.Comment;
import com.mindstack.mind_stack_id.models.CommentReaction;
import com.mindstack.mind_stack_id.models.CommentReaction.ReactionType;
import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.models.dto.CommentDTO;
import com.mindstack.mind_stack_id.repositories.CommentReactionRepository;
import com.mindstack.mind_stack_id.repositories.CommentRepository;
import com.mindstack.mind_stack_id.repositories.PostRepository;
import com.mindstack.mind_stack_id.repositories.UserRepository;
import com.mindstack.mind_stack_id.services.CommentService;

@Service
public class CommentImplementation implements CommentService {

    private final CommentRepository commentRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final CommentReactionRepository commentReactionRepository;

    public CommentImplementation(CommentRepository commentRepo, PostRepository postRepo, UserRepository userRepo,
            CommentReactionRepository commentReactionRepository) {
        this.commentRepo = commentRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.commentReactionRepository = commentReactionRepository;
    }

    @Override
    public List<CommentDTO> getAllComments(Long userId) {
        return commentRepo.findAll()
                .stream()
                .map(comment -> mapToDto(comment, userId))
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
    public CommentDTO like(long id, Long userId) {
        Comment existing = getCommentById(id);

        if (userId == null) {
            existing.setNumLike(existing.getNumLike() + 1);
            Comment saved = commentRepo.save(existing);
            return mapToDto(saved, null);
        }

        ReactionType newReaction = ReactionType.LIKE;
        var existingReaction = commentReactionRepository.findByCommentIdAndUserId(id, userId);

        if (existingReaction.isPresent()) {
            CommentReaction reaction = existingReaction.get();
            if (reaction.getReaction() == ReactionType.LIKE) {
                existing.setNumLike(Math.max(0, existing.getNumLike() - 1));
                commentReactionRepository.delete(reaction);
            } else {
                existing.setNumDislike(Math.max(0, existing.getNumDislike() - 1));
                existing.setNumLike(existing.getNumLike() + 1);
                reaction.setReaction(newReaction);
                commentReactionRepository.save(reaction);
            }
        } else {
            existing.setNumLike(existing.getNumLike() + 1);
            CommentReaction reaction = new CommentReaction();
            reaction.setCommentId(id);
            reaction.setUserId(userId);
            reaction.setReaction(newReaction);
            commentReactionRepository.save(reaction);
        }

        Comment saved = commentRepo.save(existing);
        return mapToDto(saved, userId);
    }

    @Override
    public CommentDTO dislike(long id, Long userId) {
        Comment existing = getCommentById(id);

        if (userId == null) {
            existing.setNumDislike(existing.getNumDislike() + 1);
            Comment saved = commentRepo.save(existing);
            return mapToDto(saved, null);
        }

        ReactionType newReaction = ReactionType.DISLIKE;
        var existingReaction = commentReactionRepository.findByCommentIdAndUserId(id, userId);

        if (existingReaction.isPresent()) {
            CommentReaction reaction = existingReaction.get();
            if (reaction.getReaction() == ReactionType.DISLIKE) {
                existing.setNumDislike(Math.max(0, existing.getNumDislike() - 1));
                commentReactionRepository.delete(reaction);
            } else {
                existing.setNumLike(Math.max(0, existing.getNumLike() - 1));
                existing.setNumDislike(existing.getNumDislike() + 1);
                reaction.setReaction(newReaction);
                commentReactionRepository.save(reaction);
            }
        } else {
            existing.setNumDislike(existing.getNumDislike() + 1);
            CommentReaction reaction = new CommentReaction();
            reaction.setCommentId(id);
            reaction.setUserId(userId);
            reaction.setReaction(newReaction);
            commentReactionRepository.save(reaction);
        }

        Comment saved = commentRepo.save(existing);
        return mapToDto(saved, userId);
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

    private CommentDTO mapToDto(Comment comment, Long userId) {
        // Count replies to this comment (only if it's not a reply itself)
        int replyCount = 0;
        if (comment.getParentCommentId() == null) {
            replyCount = (int) commentRepo.countByParentCommentId(comment.getCommentId());
        }

        boolean userLiked = false;
        boolean userDisliked = false;
        if (userId != null) {
            var reactionOpt = commentReactionRepository.findByCommentIdAndUserId(comment.getCommentId(), userId);
            if (reactionOpt.isPresent()) {
                ReactionType reaction = reactionOpt.get().getReaction();
                userLiked = reaction == ReactionType.LIKE;
                userDisliked = reaction == ReactionType.DISLIKE;
            }
        }
        
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
                comment.getParentCommentId(),
                replyCount,
                userLiked,
                userDisliked);
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
