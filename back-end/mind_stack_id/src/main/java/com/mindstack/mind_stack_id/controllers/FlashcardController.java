package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.FlashCardItem;
import com.mindstack.mind_stack_id.models.dto.CreateFlashcardSetRequest;
import com.mindstack.mind_stack_id.models.dto.FlashcardItemRequest;
import com.mindstack.mind_stack_id.models.dto.FlashcardSetResponse;
import com.mindstack.mind_stack_id.services.FlashCardService;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    @Autowired
    private FlashCardService flashcardService;
    /**
     * Create a new flashcard set with flashcards
     * POST /api/flashcards
     * 
     * Request body example:
     * {
     *   "userId": 12345,
     *   "title": "Java Programming Basics",
     *   "description": "Fundamental concepts of Java programming language",
     *   "isPublic": true,
     *   "flashcards": [
     *     {
     *       "title": "What is a variable?",
     *       "description": "A container that holds data values"
     *     },
     *     {
     *       "title": "What is OOP?",
     *       "description": "Object-Oriented Programming"
     *     }
     *   ]
     * }
     */
    @PostMapping
    public ResponseEntity<FlashcardSetResponse> createFlashcardSet(
            @RequestBody CreateFlashcardSetRequest request) {
        try {
            FlashcardSetResponse response = flashcardService.createFlashcardSet(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get flashcard set by ID with all its flashcards
     * GET /api/flashcards/id/{id}
     */
    
    @GetMapping("/id/{id}")
    public ResponseEntity<FlashcardSetResponse> getFlashcardSetById(@PathVariable Long id) {
        try {
            FlashcardSetResponse response = flashcardService.getFlashcardSetById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get flashcard set by slug with all its flashcards
     * GET /api/flashcards/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<FlashcardSetResponse> getFlashcardSetBySlug(@PathVariable String slug) {
        try {
            FlashcardSetResponse response = flashcardService.getFlashcardSetBySlug(slug);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all flashcard sets by user ID
     * GET /api/flashcards/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FlashcardSetResponse>> getFlashcardSetsByUserId(
            @PathVariable Long userId) {
        List<FlashcardSetResponse> responses = flashcardService.getFlashcardSetsByUserId(userId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get all public flashcard sets
     * GET /api/flashcards/public
     */
    @GetMapping("/public")
    public ResponseEntity<List<FlashcardSetResponse>> getAllPublicFlashcardSets() {
        List<FlashcardSetResponse> responses = flashcardService.getAllPublicFlashcardSets();
        return ResponseEntity.ok(responses);
    }

    /**
     * Update flashcard set
     * PUT /api/flashcards/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<FlashcardSetResponse> updateFlashcardSet(
            @PathVariable Long id,
            @RequestBody CreateFlashcardSetRequest request) {
        try {
            FlashcardSetResponse response = flashcardService.updateFlashcardSet(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete flashcard set (and all its flashcards)
     * DELETE /api/flashcards/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFlashcardSet(@PathVariable Long id) {
        try {
            flashcardService.deleteFlashcardSet(id);
            return ResponseEntity.ok("Flashcard set deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Flashcard set not found");
        }
    }

    /**
     * Add a single flashcard to an existing set
     * POST /api/flashcards/{studySetId}/flashcard
     * 
     * Request body example:
     * {
     *   "title": "What is polymorphism?",
     *   "description": "The ability of objects to take many forms"
     * }
     */
    @PostMapping("/{studySetId}/flashcard")
    public ResponseEntity<FlashCardItem> addFlashcardToSet(
            @PathVariable Long studySetId,
            @RequestBody FlashcardItemRequest request) {
        try {
            FlashCardItem flashcard = flashcardService.addFlashcardToSet(studySetId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(flashcard);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Delete a single flashcard
     * DELETE /api/flashcards/flashcard/{flashcardId}
     */
    @DeleteMapping("/flashcard/{flashcardId}")
    public ResponseEntity<String> deleteFlashcard(@PathVariable Long flashcardId) {
        try {
            flashcardService.deleteFlashcard(flashcardId);
            return ResponseEntity.ok("Flashcard deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Flashcard not found");
        }
    }
}