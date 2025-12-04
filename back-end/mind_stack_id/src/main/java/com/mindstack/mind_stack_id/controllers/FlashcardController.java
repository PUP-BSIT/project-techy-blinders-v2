package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.FlashcardCreation;
import com.mindstack.mind_stack_id.models.dto.FlashcardDTO;
import com.mindstack.mind_stack_id.services.FlashCardService;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    @Autowired
    private FlashCardService flashcardService;

    @GetMapping("/getflashcards")
    public ResponseEntity<List<FlashcardDTO>> getFlashcards() {
        List<FlashcardDTO> flashcards = flashcardService.getAllFlashcards();
        return ResponseEntity.ok(flashcards);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlashcardCreation> getFlashcardById(@PathVariable Long id) {
        try {
            FlashcardCreation flashcard = flashcardService.getFlashcardById(id);
            return ResponseEntity.ok(flashcard);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<FlashcardCreation> createFlashcard(@RequestBody FlashcardCreation flashcard) {
        FlashcardCreation createdFlashcard = flashcardService.createFlashcard(flashcard);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFlashcard);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashcardCreation> updateFlashcard(
            @PathVariable Long id, 
            @RequestBody FlashcardCreation flashcardDetails) {
        try {
            FlashcardCreation updatedFlashcard = flashcardService.updateFlashcard(id, flashcardDetails);
            return ResponseEntity.ok(updatedFlashcard);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFlashcard(@PathVariable Long id) {
        try {
            flashcardService.deleteFlashcard(id);
            return ResponseEntity.ok("Flashcard deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Flashcard not found");
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FlashcardCreation>> getFlashcardsByUserId(@PathVariable Long userId) {
        List<FlashcardCreation> flashcards = flashcardService.getFlashcardsByUserId(userId);
        return ResponseEntity.ok(flashcards);
    }
}