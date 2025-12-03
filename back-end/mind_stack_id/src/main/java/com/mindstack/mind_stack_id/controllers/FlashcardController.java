package com.mindstack.mind_stack_id.controllers;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.FlashcardCreation;
import com.mindstack.mind_stack_id.models.dto.FlashcardDTO;
import com.mindstack.mind_stack_id.repositories.Flashcard;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {

    @Autowired
    private Flashcard repo;

    @GetMapping("/getflashcards")
    public List<FlashcardDTO> getFlashcards() {
        return repo.findAll()
            .stream()
            .map(f -> new FlashcardDTO(
                    f.getFlashcardId(),
                    f.getTitle(),
                    f.getDescription()
            ))
            .toList();
    }

    @GetMapping("/{id}")
    public FlashcardCreation getFlashcardById(@PathVariable Long id) {
        Optional<FlashcardCreation> flashcard = repo.findById(id);
        return flashcard.orElse(null);
    }

    @PostMapping
    public FlashcardCreation createFlashcard(@RequestBody FlashcardCreation flashcard) {
        long randomId = ThreadLocalRandom.current().nextLong(10000000000L, 99999999999L);
        flashcard.setFlashcardId(randomId);

        if (flashcard.getIsPublic() == null) {
            flashcard.setIsPublic(false);
        }

        System.out.println("Created flashcard with ID: " + flashcard.getFlashcardId());
        System.out.println("Title: " + flashcard.getTitle());
        System.out.println("User ID: " + flashcard.getUserId());
        
        return repo.save(flashcard);
    }

    @PutMapping("/{id}")
    public String updateFlashcard(@PathVariable Long id, @RequestBody FlashcardCreation flashcardDetails) {
        Optional<FlashcardCreation> existingFlashcard = repo.findById(id);
        
        if (existingFlashcard.isEmpty()) {
            return "Flashcard not found";
        }
        
        FlashcardCreation flashcard = existingFlashcard.get();
        
        if (flashcardDetails.getTitle() != null) {
            flashcard.setTitle(flashcardDetails.getTitle());
        }
        if (flashcardDetails.getDescription() != null) {
            flashcard.setDescription(flashcardDetails.getDescription());
        }
        if (flashcardDetails.getIsPublic() != null) {
            flashcard.setIsPublic(flashcardDetails.getIsPublic());
        }
        
        repo.save(flashcard);
        
        System.out.println("Updated flashcard with ID: " + id);
        
        return "Flashcard updated successfully";
    }

    @DeleteMapping("/{id}")
    public String deleteFlashcard(@PathVariable Long id) {
        Optional<FlashcardCreation> flashcard = repo.findById(id);
        
        if (flashcard.isEmpty()) {
            return "Flashcard not found";
        }
        
        repo.deleteById(id);
        
        System.out.println("Deleted flashcard with ID: " + id);
        
        return "Flashcard deleted successfully";
    }

    @GetMapping("/user/{userId}")
    public List<FlashcardCreation> getFlashcardsByUserId(@PathVariable Long userId) {
        return repo.findByUserId(userId);
    }
}