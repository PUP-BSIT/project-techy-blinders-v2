package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.PostCreation.CategoryType;
import com.mindstack.mind_stack_id.models.dto.PostDTO;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.repositories.PostRepository;
import com.mindstack.mind_stack_id.repositories.UserRepository;
import com.mindstack.mind_stack_id.services.PostService;

@Service
public class PostImplementation implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public PostCreation createPost(PostCreation post) {
        long randomPostId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);
        post.setPostId(randomPostId);
        
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        
        if (post.getPublish() == null) {
            post.setPublish(false);
        }

        // Initialize nullable counters/toggles to sane defaults if missing
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
        
        System.out.println("Created post with ID: " + post.getPostId());
        
        return postRepository.save(post);
    }

    @Override
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll()
            .stream()
            .map(this::mapToDto)
            .toList();
    }

    @Override
    public PostCreation getPostById(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        return post.orElse(null);
    }

    @Override
    public List<PostDTO> getPostsByUserId(long userId) {
        return postRepository.findByUserId(userId)
                .stream()
            .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<PostDTO> getPostsByCategory(String category) {
        CategoryType categoryType = CategoryType.fromValue(category);
        return postRepository.findByCategory(categoryType)
                .stream()
            .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<PostDTO> getPublishedPosts() {
        return postRepository.findByIsPublished(true)
                .stream()
            .map(this::mapToDto)
                .toList();
    }

    @Override
    public PostCreation updatePost(long id, PostCreation post) {
        Optional<PostCreation> existingPost = postRepository.findById(id);
        if (existingPost.isPresent()) {
            PostCreation updatedPost = existingPost.get();
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
            updatedPost.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Updated post with ID: " + updatedPost.getPostId());
            
            return postRepository.save(updatedPost);
        }
        
        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    public boolean deletePost(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            postRepository.deleteById(id);
            System.out.println("Deleted post with ID: " + id);
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
            publishedPost.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Published post with ID: " + publishedPost.getPostId());
            
            return postRepository.save(publishedPost);
        }
        
        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    public PostCreation unpublishPost(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            PostCreation unpublishedPost = post.get();
            unpublishedPost.setPublish(false);
            unpublishedPost.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Unpublished post with ID: " + unpublishedPost.getPostId());
            
            return postRepository.save(unpublishedPost);
        }
        
        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    public PostCreation likePost(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            PostCreation likedPost = post.get();
            likedPost.setNumLike(likedPost.getNumLike() != null ? likedPost.getNumLike() + 1 : 1);
            likedPost.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Liked post with ID: " + likedPost.getPostId());
            
            return postRepository.save(likedPost);
        }
        
        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    public PostCreation dislikePost(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            PostCreation dislikedPost = post.get();
            dislikedPost.setNumDislike(dislikedPost.getNumDislike() != null ? dislikedPost.getNumDislike() + 1 : 1);
            dislikedPost.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Disliked post with ID: " + dislikedPost.getPostId());
            
            return postRepository.save(dislikedPost);
        }
        
        System.out.println("Post not found: " + id);
        return null;
    }

    private PostDTO mapToDto(PostCreation post) {
        String username = post.getUsername();
        System.out.println("Post ID: " + post.getPostId() + ", User ID: " + post.getUserId() + ", Original username: " + username);
        
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
                post.getNumDislike() != null ? post.getNumDislike() : 0
        );
    }
}