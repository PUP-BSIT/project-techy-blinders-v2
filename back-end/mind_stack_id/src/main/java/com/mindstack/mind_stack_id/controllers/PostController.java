package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.dto.PostDTO;
import com.mindstack.mind_stack_id.services.PostService;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.repositories.UserRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<PostCreation> createPost(@RequestBody PostCreation post) {
        PostCreation createdPost = postService.createPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts(@RequestParam(value = "userId", required = false) Long userId) {
        List<PostDTO> posts = postService.getAllPosts(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostCreation> getPostById(@PathVariable("id") long id) {
        PostCreation post = postService.getPostById(id);

        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDTO>> getPostsByUserId(@PathVariable("userId") long userId) {
        List<PostDTO> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/category")
    public ResponseEntity<List<PostDTO>> getPostsByCategory(@RequestParam("category") String category) {
        try {
            List<PostDTO> posts = postService.getPostsByCategory(category);
            return ResponseEntity.ok(posts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/published")
    public ResponseEntity<List<PostDTO>> getPublishedPosts(@RequestParam(required = false) Long userId) {
        List<PostDTO> posts = postService.getPublishedPosts(userId);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable("id") long id, @RequestBody PostCreation post) {
        PostCreation updatedPost = postService.updatePost(id, post);

        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        PostDTO dto = new PostDTO(
                updatedPost.getPostId(),
                updatedPost.getUserId(),
                updatedPost.getTitle(),
                updatedPost.getUsername() != null ? updatedPost.getUsername() : "Unknown",
                updatedPost.getContent(),
                updatedPost.getSlug(),
                updatedPost.getCategory() != null ? updatedPost.getCategory().getValue() : "",
                updatedPost.getPublish(),
                updatedPost.getCreatedAt(),
                updatedPost.getUpdatedAt(),
                updatedPost.getCommentCount(),
                updatedPost.getShowComment(),
                updatedPost.getNumLike(),
                updatedPost.getNumDislike(),
                false,
                false,
                updatedPost.getEdited() != null ? updatedPost.getEdited() : false);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(
            @PathVariable("id") long id,
            @RequestParam(required = false, defaultValue = "false") boolean setPrivate) {
        // Fetch the post first
        PostCreation post = postService.getPostById(id);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        // Determine the current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        // Only the owner of the post can delete it
        if (post.getUserId() != currentUser.getUserId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden: You can only delete your own post");
        }

        boolean deleted = postService.deletePost(id, setPrivate, currentUser.getUserId());
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        return ResponseEntity.ok("Post deleted successfully");
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<PostCreation> publishPost(@PathVariable("id") long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        PostCreation post = postService.getPostById(id);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        if (post.getUserId() != currentUser.getUserId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        PostCreation publishedPost = postService.publishPost(id);

        if (publishedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(publishedPost);
    }

    @PutMapping("/{id}/unpublish")
    public ResponseEntity<PostCreation> unpublishPost(
            @PathVariable("id") long id,
            @RequestParam(value = "setPrivate", defaultValue = "false") boolean setPrivate) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        PostCreation post = postService.getPostById(id);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        if (post.getUserId() != currentUser.getUserId()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        PostCreation unpublishedPost = postService.unpublishPost(id, setPrivate, currentUser.getUserId());

        if (unpublishedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(unpublishedPost);
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<PostDTO> likePost(@PathVariable("id") long id,
            @RequestParam(value = "userId", required = false) Long userId) {
        PostDTO likedPost = postService.likePost(id, userId);

        if (likedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(likedPost);
    }

    @PutMapping("/{id}/dislike")
    public ResponseEntity<PostDTO> dislikePost(@PathVariable("id") long id,
            @RequestParam(value = "userId", required = false) Long userId) {
        PostDTO dislikedPost = postService.dislikePost(id, userId);

        if (dislikedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(dislikedPost);
    }
}