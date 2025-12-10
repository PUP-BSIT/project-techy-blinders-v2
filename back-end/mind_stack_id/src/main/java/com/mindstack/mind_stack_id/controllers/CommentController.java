package com.mindstack.mind_stack_id.controllers;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.Comment;
import com.mindstack.mind_stack_id.models.FlashcardSet;
import com.mindstack.mind_stack_id.models.User;
import com.mindstack.mind_stack_id.models.dto.CommentDTO;
import com.mindstack.mind_stack_id.repositories.CommentRepository;
import com.mindstack.mind_stack_id.repositories.FlashcardSetRepository;
import com.mindstack.mind_stack_id.repositories.UserRepository;
@RestController
@RequestMapping("/api/comments")
public class CommentController {
    
    @Autowired
    private CommentRepository commentRepo;
    
    @Autowired
    private FlashcardSetRepository flashcardRepo;
    
    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public List<CommentDTO> getAllComments() {
        return commentRepo.findAll()
                .stream()
                .map(f -> new CommentDTO(
                    f.getFlashcardId(),
                    f.getContent(),
                    f.getUserId()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommentById(@PathVariable Long id) {
        Optional<Comment> comment = commentRepo.findById(id);
        
        if (comment.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Comment not found");
        }
        
        return ResponseEntity.ok(comment.get());
    }

    @GetMapping("/flashcard/{flashcardId}")
    public ResponseEntity<?> getCommentsByFlashcardId(@PathVariable Long flashcardId) {
        Optional<FlashcardSet> flashcard = flashcardRepo.findById(flashcardId);
        
        if (flashcard.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Flashcard not found");
        }
        
        List<Comment> comments = commentRepo.findByFlashcardId(flashcardId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCommentsByUserId(@PathVariable Long userId) {
        Optional<User> user = userRepo.findById(userId);
        
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User not found");
        }
        
        List<Comment> comments = commentRepo.findByUserId(userId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/flashcard/{flashcardId}/user/{userId}")
    public ResponseEntity<?> getCommentsByFlashcardAndUser(@PathVariable Long flashcardId, @PathVariable Long userId) {
        Optional<FlashcardSet> flashcard = flashcardRepo.findById(flashcardId);
        
        if (flashcard.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Flashcard not found");
        }
        
        Optional<User> user = userRepo.findById(userId);
        
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User not found");
        }
        
        List<Comment> comments = commentRepo.findByFlashcardIdAndUserId(flashcardId, userId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody Comment comment) {
        if (comment.getUserId() == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("User ID is required");
        }

        if (comment.getFlashcardId() == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Flashcard ID is required");
        }

        Optional<User> user = userRepo.findById(comment.getUserId());
        
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User with ID " + comment.getUserId() + " not found");
        }

        Optional<FlashcardSet> flashcard = flashcardRepo.findById(comment.getFlashcardId());
        
        if (flashcard.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Flashcard with ID " + comment.getFlashcardId() + " not found");
        }

        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Comment content is required");
        }

        long randomCommentId = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        comment.setCommentId(randomCommentId);

        Comment savedComment = commentRepo.save(comment);

        System.out.println("Comment ID: " + savedComment.getCommentId());
        System.out.println("User ID: " + savedComment.getUserId());
        System.out.println("Flashcard ID: " + savedComment.getFlashcardId());
        System.out.println("Content: " + savedComment.getContent());
        System.out.println("Created At: " + savedComment.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id, @RequestBody Comment commentDetails) {
        Optional<Comment> existingComment = commentRepo.findById(id);
        
        if (existingComment.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Comment not found");
        }
        
        Comment comment = existingComment.get();
        
        if (commentDetails.getContent() != null && !commentDetails.getContent().trim().isEmpty()) {
            comment.setContent(commentDetails.getContent());
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Comment content cannot be empty");
        }
        
        commentRepo.save(comment);
        
        System.out.println("Updated comment with ID: " + id);
        
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        Optional<Comment> comment = commentRepo.findById(id);
        
        if (comment.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Comment not found");
        }
        
        commentRepo.deleteById(id);
        
        System.out.println("Deleted comment with ID: " + id);
        
        return ResponseEntity.ok("Comment deleted successfully");
    }

    @GetMapping("/flashcard/{flashcardId}/count")
    public ResponseEntity<?> getCommentCountByFlashcard(@PathVariable Long flashcardId) {
        Optional<FlashcardSet> flashcard = flashcardRepo.findById(flashcardId);
        
        if (flashcard.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Flashcard not found");
        }
        
        long commentCount = commentRepo.countByFlashcardId(flashcardId);
        
        return ResponseEntity.ok(new CommentCount(flashcardId, commentCount));
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<?> getCommentCountByUser(@PathVariable Long userId) {
        Optional<User> user = userRepo.findById(userId);
        
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User not found");
        }
        
        long commentCount = commentRepo.countByUserId(userId);
        
        return ResponseEntity.ok(new CommentCount(userId, commentCount));
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