package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.dto.PostDTO;
import com.mindstack.mind_stack_id.services.PostService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<PostCreation> createPost(@RequestBody PostCreation post) {
        PostCreation createdPost = postService.createPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        List<PostDTO> posts = postService.getAllPosts();
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
    public ResponseEntity<List<PostDTO>> getPublishedPosts() {
        List<PostDTO> posts = postService.getPublishedPosts();
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostCreation> updatePost(@PathVariable("id") long id, @RequestBody PostCreation post) {
        PostCreation updatedPost = postService.updatePost(id, post);
        
        if (updatedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable("id") long id) {
        boolean deleted = postService.deletePost(id);
        
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }
        
        return ResponseEntity.ok("Post deleted successfully");
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<PostCreation> publishPost(@PathVariable("id") long id) {
        PostCreation publishedPost = postService.publishPost(id);
        
        if (publishedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        
        return ResponseEntity.ok(publishedPost);
    }

    @PutMapping("/{id}/unpublish")
    public ResponseEntity<PostCreation> unpublishPost(@PathVariable("id") long id) {
        PostCreation unpublishedPost = postService.unpublishPost(id);
        
        if (unpublishedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        
        return ResponseEntity.ok(unpublishedPost);
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<PostCreation> likePost(@PathVariable("id") long id) {
        PostCreation likedPost = postService.likePost(id);
        
        if (likedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        
        return ResponseEntity.ok(likedPost);
    }

    @PutMapping("/{id}/dislike")
    public ResponseEntity<PostCreation> dislikePost(@PathVariable("id") long id) {
        PostCreation dislikedPost = postService.dislikePost(id);
        
        if (dislikedPost == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        
        return ResponseEntity.ok(dislikedPost);
    }
}