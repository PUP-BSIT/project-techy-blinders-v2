package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mindstack.mind_stack_id.models.FlashcardCreation;
import com.mindstack.mind_stack_id.models.dto.FlashcardDTO;
import com.mindstack.mind_stack_id.repositories.Flashcard;
import com.mindstack.mind_stack_id.services.FlashCardService;

@Service
public class FlashcardImplementation implements FlashCardService {

    @Autowired
    private Flashcard flashcardRepository;

    @Override
    public List<FlashcardDTO> getAllFlashcards() {
        return flashcardRepository.findAll()
            .stream()
            .map(f -> new FlashcardDTO(
                f.getStudySetId(),
                f.getFlashcardId(),
                f.getTitle(),
                f.getDescription()
            ))
            .collect(Collectors.toList());
    }


    @Override
    public FlashcardCreation getFlashcardBySlug(String slug) {
        return flashcardRepository.findBySlug(slug)
            .orElseThrow(() -> new RuntimeException("Flashcard not found with slug: " + slug));
    }

    @Override
    public FlashcardCreation getFlashcardById(Long id) {
        return flashcardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Flashcard not found with id: " + id));
    }

    @Override
    public FlashcardCreation createFlashcard(FlashcardCreation flashcard) {
        long randomFlashcardId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);
        long randomStudySetId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);
        
        flashcard.setFlashcardId(randomFlashcardId);
        flashcard.setStudySetId(randomStudySetId);

        String slug = generateSlug(flashcard.getTitle(), randomFlashcardId);
        flashcard.setSlug(slug);

        if (!flashcard.isPublic()) {
            flashcard.setPublic(false);
        }
        
        LocalDateTime now = LocalDateTime.now();
        flashcard.setCreatedAt(now);
        flashcard.setUpdatedAt(now);
        
        System.out.println("Created flashcard with ID: " + flashcard.getFlashcardId());
        System.out.println("Created study set with ID: " + flashcard.getStudySetId());
        System.out.println("Title: " + flashcard.getTitle());
        System.out.println("User ID: " + flashcard.getUserId());
        
        return flashcardRepository.save(flashcard);
    }

    @Override
    public FlashcardCreation updateFlashcard(Long id, FlashcardCreation flashcardDetails) {
        FlashcardCreation flashcard = flashcardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Flashcard not found with id: " + id));
        
        if (flashcardDetails.getTitle() != null) {
            flashcard.setTitle(flashcardDetails.getTitle());
            String newSlug = generateSlug(flashcardDetails.getTitle(), flashcard.getFlashcardId());
            flashcard.setSlug(newSlug);
        }
        if (flashcardDetails.getDescription() != null) {
            flashcard.setDescirption(flashcardDetails.getDescription());
        }
        
        flashcard.setPublic(flashcardDetails.isPublic());
        flashcard.setUpdatedAt(LocalDateTime.now());
        
        System.out.println("Updated flashcard with ID: " + id);
        
        return flashcardRepository.save(flashcard);
    }

    @Override
    public void deleteFlashcard(Long id) {
        flashcardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Flashcard not found with id: " + id));
        
        flashcardRepository.deleteById(id);
        
        System.out.println("Deleted flashcard with ID: " + id);
    }

    @Override
    public void deleteStudySet(Long studySetId) {
        flashcardRepository.findById(studySetId)
            .orElseThrow(() -> new RuntimeException("Study set not found with id: " + studySetId));
        
        flashcardRepository.deleteById(studySetId);
        
        System.out.println("Deleted study set with ID: " + studySetId);
    }

    @Override
    public List<FlashcardCreation> getFlashcardsByUserId(Long userId) {
        return flashcardRepository.findByUserId(userId);
    }

    private String generateSlug(String title, Long flashcardId) {
        if (title == null || title.trim().isEmpty()) {
            return "flashcard-" + flashcardId;
        }
        
        String baseSlug = title.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
        
        if (baseSlug.isEmpty()) {
            baseSlug = "flashcard";
        }
        
        return baseSlug + "-" + flashcardId;
    }
    
}
