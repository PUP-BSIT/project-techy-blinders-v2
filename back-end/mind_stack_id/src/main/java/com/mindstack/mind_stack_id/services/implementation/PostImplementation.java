package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.PostCreation.CategoryType;
import com.mindstack.mind_stack_id.models.dto.PostDTO;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.models.PostReaction;
import com.mindstack.mind_stack_id.models.PostReaction.ReactionType;
import com.mindstack.mind_stack_id.repositories.PostRepository;
import com.mindstack.mind_stack_id.repositories.UserRepository;
import com.mindstack.mind_stack_id.repositories.PostReactionRepository;
import com.mindstack.mind_stack_id.repositories.FlashcardSetRepository;
import com.mindstack.mind_stack_id.repositories.QuizSetRepository;
import com.mindstack.mind_stack_id.services.PostService;
import com.mindstack.mind_stack_id.services.NotificationService;
import com.mindstack.mind_stack_id.models.Notification;

@Service
public class PostImplementation implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostReactionRepository postReactionRepository;

    @Autowired
    private FlashcardSetRepository flashcardSetRepository;

    @Autowired
    private QuizSetRepository quizSetRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public PostCreation createPost(PostCreation post) {
        long randomPostId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);
        post.setPostId(randomPostId);

        post.setCreatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));
        post.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));

        if (post.getPublish() == null) {
            post.setPublish(false);
        }

        if (post.getCommentCount() == null) {
            post.setCommentCount(0);
        }
        if (post.getShowComment() == null) {
            post.setShowComment(true);
        }
        if (post.getNumLike() == null) {
            post.setNumLike(0);
        }
        if (post.getNumDislike() == null) {
            post.setNumDislike(0);
        }

        ensureUsername(post);

        System.out.println("Created post with ID: " + post.getPostId());

        return postRepository.save(post);
    }

    @Override
    public List<PostDTO> getAllPosts(Long userId) {
        return postRepository.findAll()
                .stream()
                .filter(p -> p.getIsDeleted() == null || !p.getIsDeleted())
                .map(p -> mapToDto(p, userId))
                .toList();
    }

    @Override
    public PostCreation getPostById(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent() && (post.get().getIsDeleted() == null || !post.get().getIsDeleted())) {
            return post.get();
        }
        return null;
    }

    @Override
    public List<PostDTO> getPostsByUserId(long userId) {
        return postRepository.findByUserId(userId)
                .stream()
                .filter(p -> p.getIsDeleted() == null || !p.getIsDeleted())
                .map(p -> mapToDto(p, null))
                .toList();
    }

    @Override
    public List<PostDTO> getPostsByCategory(String category) {
        CategoryType categoryType = CategoryType.fromValue(category);
        return postRepository.findByCategory(categoryType)
                .stream()
                .filter(p -> p.getIsDeleted() == null || !p.getIsDeleted())
                .map(p -> mapToDto(p, null))
                .toList();
    }

    @Override
    public List<PostDTO> getPublishedPosts() {
        return postRepository.findByIsPublished(true)
                .stream()
                .filter(p -> p.getIsDeleted() == null || !p.getIsDeleted())
                .map(p -> mapToDto(p, null))
                .toList();
    }

    @Override
    public PostCreation updatePost(long id, PostCreation post) {
        Optional<PostCreation> existingPost = postRepository.findById(id);
        if (existingPost.isPresent()) {
            PostCreation updatedPost = existingPost.get();

            // Check if content fields changed to set edited flag
            boolean contentChanged = !updatedPost.getTitle().equals(post.getTitle()) ||
                    !updatedPost.getContent().equals(post.getContent()) ||
                    !updatedPost.getCategory().equals(post.getCategory());

            updatedPost.setTitle(post.getTitle());
            updatedPost.setContent(post.getContent());
            updatedPost.setSlug(post.getSlug());
            updatedPost.setCategory(post.getCategory());
            updatedPost.setUsername(post.getUsername());
            updatedPost.setPublish(post.getPublish());
            updatedPost.setShowComment(post.getShowComment());
            updatedPost.setCommentCount(post.getCommentCount());
            updatedPost.setNumLike(post.getNumLike());
            updatedPost.setNumDislike(post.getNumDislike());
            updatedPost.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));

            // Set edited flag if content changed
            if (contentChanged) {
                updatedPost.setEdited(true);
            }

            ensureUsername(updatedPost);

            System.out.println("Updated post with ID: " + updatedPost.getPostId());

            return postRepository.save(updatedPost);
        }

        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    @Transactional
    public boolean deletePost(long id, boolean setPrivate, Long actorUserId) {
        Optional<PostCreation> postOpt = postRepository.findById(id);
        if (postOpt.isPresent()) {
            PostCreation post = postOpt.get();

            if (setPrivate && actorUserId != null) {
                setUnderlyingSetPrivate(post, actorUserId);
            }

            // Soft delete: mark post as deleted instead of hard delete
            post.setIsDeleted(true);
            postRepository.save(post);

            System.out.println("Soft deleted post with ID: " + id);
            return true;
        }

        System.out.println("Post not found: " + id);
        return false;
    }

    @Override
    public PostCreation publishPost(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            PostCreation publishedPost = post.get();
            publishedPost.setPublish(true);
            publishedPost.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));
            ensureUsername(publishedPost);

            System.out.println("Published post with ID: " + publishedPost.getPostId());

            return postRepository.save(publishedPost);
        }

        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    @Transactional
    public PostCreation unpublishPost(long id, boolean setPrivate, Long actorUserId) {
        Optional<PostCreation> postOpt = postRepository.findById(id);
        if (postOpt.isPresent()) {
            PostCreation unpublishedPost = postOpt.get();
            unpublishedPost.setPublish(false);
            unpublishedPost.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));
            ensureUsername(unpublishedPost);

            if (setPrivate) {
                setUnderlyingSetPrivate(unpublishedPost, actorUserId);
            }

            System.out.println("Unpublished post with ID: " + unpublishedPost.getPostId());

            return postRepository.save(unpublishedPost);
        }

        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    public PostDTO likePost(long id, Long userId) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            PostCreation likedPost = post.get();
            likedPost.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));
            ensureUsername(likedPost);

            if (userId == null) {
                likedPost.setNumLike(likedPost.getNumLike() != null ? likedPost.getNumLike() + 1 : 1);
                PostCreation saved = postRepository.save(likedPost);
                return mapToDto(saved, null);
            }

            ReactionType newReaction = ReactionType.LIKE;
            Optional<PostReaction> existing = postReactionRepository.findByPostIdAndUserId(id, userId);

            if (existing.isPresent()) {
                PostReaction reaction = existing.get();
                if (reaction.getReaction() == ReactionType.LIKE) {
                    likedPost.setNumLike(Math.max(0, likedPost.getNumLike() != null ? likedPost.getNumLike() - 1 : 0));
                    postReactionRepository.delete(reaction);
                    notificationService.deletePostReactionNotifications(userId, id);
                } else {
                    likedPost.setNumDislike(
                            Math.max(0, likedPost.getNumDislike() != null ? likedPost.getNumDislike() - 1 : 0));
                    likedPost.setNumLike(likedPost.getNumLike() != null ? likedPost.getNumLike() + 1 : 1);
                    reaction.setReaction(newReaction);
                    postReactionRepository.save(reaction);
                    notificationService.deletePostReactionNotifications(userId, id);
                    // Notify on switch to like
                    createPostReactionNotification(likedPost, userId, "POST_LIKE", "liked your post");
                }
            } else {
                // New like
                likedPost.setNumLike(likedPost.getNumLike() != null ? likedPost.getNumLike() + 1 : 1);
                PostReaction reaction = new PostReaction();
                reaction.setPostId(id);
                reaction.setUserId(userId);
                reaction.setReaction(newReaction);
                postReactionRepository.save(reaction);
                // Notify on new like
                createPostReactionNotification(likedPost, userId, "POST_LIKE", "liked your post");
            }

            PostCreation saved = postRepository.save(likedPost);
            return mapToDto(saved, userId);
        }

        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    public PostDTO dislikePost(long id, Long userId) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            PostCreation dislikedPost = post.get();
            dislikedPost.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));
            ensureUsername(dislikedPost);

            if (userId == null) {
                dislikedPost.setNumDislike(dislikedPost.getNumDislike() != null ? dislikedPost.getNumDislike() + 1 : 1);
                PostCreation saved = postRepository.save(dislikedPost);
                return mapToDto(saved, null);
            }

            ReactionType newReaction = ReactionType.DISLIKE;
            Optional<PostReaction> existing = postReactionRepository.findByPostIdAndUserId(id, userId);

            if (existing.isPresent()) {
                PostReaction reaction = existing.get();
                if (reaction.getReaction() == ReactionType.DISLIKE) {
                    dislikedPost.setNumDislike(
                            Math.max(0, dislikedPost.getNumDislike() != null ? dislikedPost.getNumDislike() - 1 : 0));
                    postReactionRepository.delete(reaction);
                    notificationService.deletePostReactionNotifications(userId, id);
                } else {
                    dislikedPost.setNumLike(
                            Math.max(0, dislikedPost.getNumLike() != null ? dislikedPost.getNumLike() - 1 : 0));
                    dislikedPost
                            .setNumDislike(dislikedPost.getNumDislike() != null ? dislikedPost.getNumDislike() + 1 : 1);
                    reaction.setReaction(newReaction);
                    postReactionRepository.save(reaction);
                    notificationService.deletePostReactionNotifications(userId, id);
                    createPostReactionNotification(dislikedPost, userId, "POST_DISLIKE", "disliked your post");
                }
            } else {
                dislikedPost.setNumDislike(dislikedPost.getNumDislike() != null ? dislikedPost.getNumDislike() + 1 : 1);
                PostReaction reaction = new PostReaction();
                reaction.setPostId(id);
                reaction.setUserId(userId);
                reaction.setReaction(newReaction);
                postReactionRepository.save(reaction);
                createPostReactionNotification(dislikedPost, userId, "POST_DISLIKE", "disliked your post");
            }

            PostCreation saved = postRepository.save(dislikedPost);
            return mapToDto(saved, userId);
        }

        System.out.println("Post not found: " + id);
        return null;
    }

    private void createPostReactionNotification(PostCreation post, Long actorUserId, String type, String actionText) {
        if (post == null || actorUserId == null)
            return;
        Long targetUserId = post.getUserId();
        if (targetUserId == null || targetUserId.equals(actorUserId))
            return;

        String actorName = null;
        User actor = userRepository.findByUserId(actorUserId);
        if (actor != null && actor.getUsername() != null && !actor.getUsername().isBlank()) {
            actorName = actor.getUsername();
        }
        if (actorName == null || actorName.isBlank()) {
            actorName = "User " + actorUserId;
        }

        Notification n = new Notification();
        n.setUserId(targetUserId);
        n.setActorUserId(actorUserId);
        n.setPostId(post.getPostId());
        n.setType(type);
        n.setMessage(actorName + " " + actionText + ".");
        n.setIsRead(false);
        notificationService.createNotification(n);
    }

    private PostDTO mapToDto(PostCreation post, Long userId) {
        String username = post.getUsername();
        System.out.println(
                "Post ID: " + post.getPostId() + ", User ID: " + post.getUserId() + ", Original username: " + username);

        if (username == null || username.isBlank()) {
            User user = userRepository.findByUserId(post.getUserId());
            System.out.println("Looking up user by ID: " + post.getUserId() + ", Found: " + (user != null));
            if (user != null) {
                System.out.println("User found - username: " + user.getUsername());
                if (user.getUsername() != null && !user.getUsername().isBlank()) {
                    username = user.getUsername();
                }
            }
        }
        if (username == null || username.isBlank()) {
            username = "User " + post.getUserId();
        }
        System.out.println("Final username: " + username);

        boolean userLiked = false;
        boolean userDisliked = false;
        if (userId != null) {
            var reactionOpt = postReactionRepository.findByPostIdAndUserId(post.getPostId(), userId);
            if (reactionOpt.isPresent()) {
                ReactionType reaction = reactionOpt.get().getReaction();
                userLiked = reaction == ReactionType.LIKE;
                userDisliked = reaction == ReactionType.DISLIKE;
            }
        }

        return new PostDTO(
                post.getPostId(),
                post.getUserId(),
                post.getTitle(),
                username,
                post.getContent() != null ? post.getContent() : "",
                post.getSlug() != null ? post.getSlug() : "",
                post.getCategory() != null ? post.getCategory().getValue() : "",
                post.getPublish() != null ? post.getPublish() : false,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getCommentCount() != null ? post.getCommentCount() : 0,
                post.getShowComment() != null ? post.getShowComment() : true,
                post.getNumLike() != null ? post.getNumLike() : 0,
                post.getNumDislike() != null ? post.getNumDislike() : 0,
                userLiked,
                userDisliked,
                post.getEdited() != null ? post.getEdited() : false);
    }

    private void setUnderlyingSetPrivate(PostCreation post, Long actorUserId) {
        if (post == null || actorUserId == null) {
            return;
        }

        String slug = post.getSlug();
        if (slug == null || slug.isBlank()) {
            return;
        }

        if (slug.startsWith("flashcard-")) {
            Long setId = extractIdFromSlug(slug, "flashcard-");
            if (setId != null) {
                flashcardSetRepository.findById(setId).ifPresent(set -> {
                    if (actorUserId.equals(set.getUserId())) {
                        set.setPublic(false);
                        set.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));
                        flashcardSetRepository.save(set);
                    }
                });
            }
        } else if (slug.startsWith("quiz-")) {
            Long setId = extractIdFromSlug(slug, "quiz-");
            if (setId != null) {
                quizSetRepository.findById(setId).ifPresent(set -> {
                    if (actorUserId.equals(set.getUserId())) {
                        set.setPublic(false);
                        set.setUpdatedAt(LocalDateTime.now(ZoneId.of("Asia/Manila")));
                        quizSetRepository.save(set);
                    }
                });
            }
        }
    }

    private Long extractIdFromSlug(String slug, String prefix) {
        try {
            int start = prefix.length();
            int dash = slug.indexOf('-', start);
            String idPart = dash >= 0 ? slug.substring(start, dash) : slug.substring(start);
            return Long.parseLong(idPart);
        } catch (Exception ex) {
            return null;
        }
    }

    private void ensureUsername(PostCreation post) {
        if (post == null) {
            return;
        }

        String username = post.getUsername();
        if (username != null && !username.isBlank()) {
            return;
        }

        User user = userRepository.findByUserId(post.getUserId());
        if (user != null && user.getUsername() != null && !user.getUsername().isBlank()) {
            post.setUsername(user.getUsername());
            return;
        }

        post.setUsername("User " + post.getUserId());
    }
}