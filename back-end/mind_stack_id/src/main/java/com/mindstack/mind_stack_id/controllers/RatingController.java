package com.mindstack.mind_stack_id.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.Rating;
import com.mindstack.mind_stack_id.repositories.RatingRepostory;
import com.mindstack.mind_stack_id.repositories.CommentRepository;
import com.mindstack.mind_stack_id.repositories.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/rating")
public class RatingController {

    private final RatingRepostory ratingRepo;
    private final CommentRepository commentRepo;
    private final UserRepository userRepo;

    public RatingController(RatingRepostory ratingRepo, CommentRepository commentRepo, UserRepository userRepo) {
        this.ratingRepo = ratingRepo;
        this.commentRepo = commentRepo;
        this.userRepo = userRepo;
    }

    @GetMapping
    public List<Rating> getAllRatings() {
        return ratingRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRatingById(@PathVariable Long id) {
        Optional<Rating> rating = ratingRepo.findById(id);
        
        if (rating.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Rating not found");
        }

        System.out.println("Rating ID: " + rating.get().getRatingId());
        System.out.println("Rating Value: " + rating.get().getRatingValue());
        
        return ResponseEntity.ok(rating.get());
    }

    @PostMapping
    public ResponseEntity<?> createRating(@RequestBody Rating rating) {
        if (rating.getCommentId() == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Comment ID is required");
        }

        if (!commentRepo.existsById(rating.getCommentId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Comment with ID " + rating.getCommentId() + " not found. Cannot create rating.");
        }

        if (rating.getUserId() == 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("User ID is required");
        }

        if (!userRepo.existsById(rating.getUserId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User with ID " + rating.getUserId() + " not found. Cannot create rating.");
        }

        if (rating.getRatingValue() < 1 || rating.getRatingValue() > 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Rating value must be between 1 and 5");
        }

        long randomRatingId = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        rating.setRatingId(randomRatingId);

        Rating savedRating = ratingRepo.save(rating);

        System.out.println("Created rating with ID: " + savedRating.getRatingId());
        System.out.println("Associated with Comment ID: " + savedRating.getCommentId());
        System.out.println("User ID: " + savedRating.getUserId());
        System.out.println("Rating Value: " + savedRating.getRatingValue());

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRating);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRating(@PathVariable Long id, @RequestBody Rating ratingDetails) {
        Optional<Rating> existingRating = ratingRepo.findById(id);
        
        if (existingRating.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Rating not found");
        }
        
        Rating rating = existingRating.get();
        
        if (ratingDetails.getRatingValue() != 0) {
            if (ratingDetails.getRatingValue() < 1 || ratingDetails.getRatingValue() > 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Rating value must be between 1 and 5");
            }
            rating.setRatingValue((int) ratingDetails.getRatingValue());
        }
        
        Rating updatedRating = ratingRepo.save(rating);
        
        System.out.println("Updated rating with ID: " + id);
        System.out.println("New rating value: " + updatedRating.getRatingValue());
        
        return ResponseEntity.ok(updatedRating);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRating(@PathVariable Long id) {
        Optional<Rating> rating = ratingRepo.findById(id);
        
        if (rating.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Rating not found");
        }
        
        ratingRepo.deleteById(id);
        
        System.out.println("Deleted rating with ID: " + id);
        
        return ResponseEntity.ok("Rating deleted successfully");
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<?> getRatingsByCommentId(@PathVariable Long commentId) {
        if (!commentRepo.existsById(commentId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Comment not found");
        }
        
        List<Rating> ratings = ratingRepo.findByCommentId(commentId);
        
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getRatingsByUserId(@PathVariable Long userId) {
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User not found");
        }
        
        List<Rating> ratings = ratingRepo.findByUserId(userId);
        
        return ResponseEntity.ok(ratings);
    }

    @GetMapping("/comment/{commentId}/average")
    public ResponseEntity<?> getAverageRatingForComment(@PathVariable Long commentId) {
        if (!commentRepo.existsById(commentId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Comment not found");
        }
        
        List<Rating> ratings = ratingRepo.findByCommentId(commentId);
        
        if (ratings.isEmpty()) {
            return ResponseEntity.ok(0.0);
        }
        
        double average = ratings.stream()
            .mapToInt(r -> (int) r.getRatingValue())
            .average()
            .orElse(0.0);
        
        System.out.println("Average rating for comment " + commentId + ": " + average);
        
        return ResponseEntity.ok(average);
    }

    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<?> deleteRatingsByCommentId(@PathVariable Long commentId) {
        if (!commentRepo.existsById(commentId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Comment not found");
        }
        
        List<Rating> ratings = ratingRepo.findByCommentId(commentId);
        
        if (ratings.isEmpty()) {
            return ResponseEntity.ok("No ratings found for this comment");
        }
        
        ratingRepo.deleteByCommentId(commentId);
        
        System.out.println("Deleted all ratings for comment ID: " + commentId);
        
        return ResponseEntity.ok("All ratings for comment deleted successfully");
    }
}