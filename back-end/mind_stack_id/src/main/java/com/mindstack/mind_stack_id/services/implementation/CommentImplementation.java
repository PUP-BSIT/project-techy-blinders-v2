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
import com.mindstack.mind_stack_id.services.NotificationService;
import com.mindstack.mind_stack_id.models.Notification;

@Service
public class CommentImplementation implements CommentService {

    private final CommentRepository commentRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final CommentReactionRepository commentReactionRepository;
    private final NotificationService notificationService;

    public CommentImplementation(CommentRepository commentRepo, PostRepository postRepo, UserRepository userRepo,
            CommentReactionRepository commentReactionRepository, NotificationService notificationService) {
        this.commentRepo = commentRepo;
        this.postRepo = postRepo;
        this.userRepo = userRepo;
        this.commentReactionRepository = commentReactionRepository;
        this.notificationService = notificationService;
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

        Comment saved = commentRepo.save(comment);

        // Create notifications
        if (saved.getParentCommentId() == null) {
            // New top-level comment -> notify post owner
            PostCreation post = ensurePostExists(saved.getPostId());
            if (post != null) {
                createCommentNotification(post.getUserId(), saved.getUserId(), saved.getPostId(), null,
                        "POST_COMMENT", "commented on your post");
            }
        } else {
            // Reply to a comment -> notify parent comment owner
            Comment parent = ensureCommentExists(saved.getParentCommentId());
            if (parent != null) {
                createCommentNotification(parent.getUserId(), saved.getUserId(), saved.getPostId(),
                        saved.getParentCommentId(),
                        "COMMENT_REPLY", "replied to your comment");
            }
        }

        return saved;
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
        boolean shouldNotify = false;

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
                shouldNotify = true; // switch to like
            }
        } else {
            existing.setNumLike(existing.getNumLike() + 1);
            CommentReaction reaction = new CommentReaction();
            reaction.setCommentId(id);
            reaction.setUserId(userId);
            reaction.setReaction(newReaction);
            commentReactionRepository.save(reaction);
            shouldNotify = true; // new like
        }

        Comment saved = commentRepo.save(existing);
        if (shouldNotify) {
            // Notify on new like or switch to like
            createCommentReactionNotification(saved, userId, "COMMENT_LIKE", "liked your comment");
        }
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
        boolean shouldNotify = false;

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
                shouldNotify = true; // switch to dislike
            }
        } else {
            existing.setNumDislike(existing.getNumDislike() + 1);
            CommentReaction reaction = new CommentReaction();
            reaction.setCommentId(id);
            reaction.setUserId(userId);
            reaction.setReaction(newReaction);
            commentReactionRepository.save(reaction);
            shouldNotify = true; // new dislike
        }

        Comment saved = commentRepo.save(existing);
        if (shouldNotify) {
            // Notify on new dislike or switch to dislike
            createCommentReactionNotification(saved, userId, "COMMENT_DISLIKE", "disliked your comment");
        }
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

    private void createCommentNotification(Long targetUserId, Long actorUserId, Long postId, Long commentId,
            String type, String actionText) {
        if (targetUserId == null || actorUserId == null)
            return;
        if (targetUserId.equals(actorUserId))
            return;

        String actorName = null;
        User actor = userRepo.findByUserId(actorUserId);
        if (actor != null && actor.getUsername() != null && !actor.getUsername().isBlank()) {
            actorName = actor.getUsername();
        }
        if (actorName == null || actorName.isBlank()) {
            actorName = "User " + actorUserId;
        }

        Notification n = new Notification();
        n.setUserId(targetUserId);
        n.setActorUserId(actorUserId);
        n.setPostId(postId);
        n.setCommentId(commentId);
        n.setType(type);
        n.setMessage(actorName + " " + actionText + ".");
        n.setIsRead(false);
        notificationService.createNotification(n);
    }

    private void createCommentReactionNotification(Comment comment, Long actorUserId, String type, String actionText) {
        if (comment == null || actorUserId == null)
            return;
        Long targetUserId = comment.getUserId();
        createCommentNotification(targetUserId, actorUserId, comment.getPostId(), comment.getCommentId(), type,
                actionText);
    }
}
