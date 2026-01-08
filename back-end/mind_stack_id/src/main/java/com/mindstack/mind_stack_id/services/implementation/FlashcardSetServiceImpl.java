package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import jakarta.persistence.EntityManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mindstack.mind_stack_id.models.FlashCardItem;
import com.mindstack.mind_stack_id.models.FlashcardSet;
import com.mindstack.mind_stack_id.models.dto.CreateFlashcardSetRequest;
import com.mindstack.mind_stack_id.models.dto.FlashcardItemDTO;
import com.mindstack.mind_stack_id.models.dto.FlashcardItemRequest;
import com.mindstack.mind_stack_id.models.dto.FlashcardResponseDTO;
import com.mindstack.mind_stack_id.models.dto.FlashcardSetResponse;
import com.mindstack.mind_stack_id.repositories.FlashcardSetRepository;
import com.mindstack.mind_stack_id.repositories.PostRepository;
import com.mindstack.mind_stack_id.services.FlashCardService;

@Service
public class FlashcardSetServiceImpl implements FlashCardService {

    @Autowired
    private FlashcardSetRepository flashcardSetRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private PostRepository postRepository;

    @Override
    @Transactional
    public FlashcardSetResponse createFlashcardSet(CreateFlashcardSetRequest request) {
        long studySetId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);

        FlashcardSet flashcardSet = new FlashcardSet();
        flashcardSet.setStudySetId(studySetId);
        flashcardSet.setUserId(request.getUserId());
        flashcardSet.setTitle(request.getTitle());
        flashcardSet.setDescription(request.getDescription());
        flashcardSet.setPublic(request.isPublic());

        String slug = generateSlug(request.getTitle(), studySetId);
        flashcardSet.setSlug(slug);

        // Create flashcards if provided
        if (request.getFlashcards() != null && !request.getFlashcards().isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            int counter = 0;
            for (FlashcardItemDTO flashcardDTO : request.getFlashcards()) {
                long flashcardId = flashcardDTO.getFlashcardId() != null
                        ? flashcardDTO.getFlashcardId()
                        : System.currentTimeMillis() * 1000 + counter++;

                FlashCardItem flashcard = new FlashCardItem();
                flashcard.setFlashcardId(flashcardId);
                flashcard.setTitle(flashcardDTO.getTitle());
                flashcard.setDescription(flashcardDTO.getDescription());
                flashcard.setCreatedAt(now);
                flashcard.setUpdatedAt(now);

                // Add flashcard to the set (sets bidirectional relationship)
                flashcardSet.addFlashcard(flashcard);
            }
        }
        LocalDateTime now = LocalDateTime.now();
        flashcardSet.setCreatedAt(now);
        flashcardSet.setUpdatedAt(now);

        // Save the flashcard set (this will cascade save the flashcards)
        FlashcardSet savedSet = flashcardSetRepository.save(flashcardSet);

        System.out.println("Created flashcard set with ID: " + savedSet.getStudySetId());
        System.out.println("Number of flashcards: " + savedSet.getFlashcards().size());

        // Convert to response DTO
        return convertToResponse(savedSet);
    }

    @Override
    public FlashcardSetResponse getFlashcardSetById(Long studySetId) {
        FlashcardSet flashcardSet = flashcardSetRepository.findById(studySetId)
            .filter(set -> !set.isDeleted())
            .orElseThrow(() -> new RuntimeException("Flashcard set not found with id: " + studySetId));
        return convertToResponse(flashcardSet);
    }

    @Override
    public FlashcardSetResponse getFlashcardSetBySlug(String slug) {
        FlashcardSet flashcardSet = flashcardSetRepository.findBySlugAndIsDeletedFalse(slug)
            .orElseThrow(() -> new RuntimeException("Flashcard set not found with slug: " + slug));
        return convertToResponse(flashcardSet);
    }

    @Override
    public List<FlashcardSetResponse> getFlashcardSetsByUserId(Long userId) {
        List<FlashcardSet> flashcardSets = flashcardSetRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
        return flashcardSets.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<FlashcardSetResponse> getAllPublicFlashcardSets() {
        List<FlashcardSet> flashcardSets = flashcardSetRepository.findByIsPublicTrueAndIsDeletedFalseOrderByCreatedAtDesc();
        return flashcardSets.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FlashcardSetResponse updateFlashcardSet(Long studySetId, CreateFlashcardSetRequest request) {
        FlashcardSet flashcardSet = flashcardSetRepository.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found with id: " + studySetId));

        // Update basic fields
        if (request.getTitle() != null) {
            flashcardSet.setTitle(request.getTitle());
            String newSlug = generateSlug(request.getTitle(), studySetId);
            flashcardSet.setSlug(newSlug);
        }
        if (request.getDescription() != null) {
            flashcardSet.setDescription(request.getDescription());
        }
        flashcardSet.setPublic(request.isPublic());
        flashcardSet.setUpdatedAt(LocalDateTime.now());

        // Log incoming flashcards for debugging
        if (request.getFlashcards() != null) {
            System.out.println("Incoming flashcards payload for update:");
            request.getFlashcards().forEach(dto -> System.out.println("  dto.title='" + dto.getTitle()
                    + "', dto.description='" + dto.getDescription() + "', dto.id='" + dto.getFlashcardId() + "'"));

            System.out.println("Current flashcards in set BEFORE update:");
            flashcardSet.getFlashcards().forEach(f -> System.out.println("  existing: id=" + f.getFlashcardId()
                    + ", title='" + f.getTitle() + "', description='" + f.getDescription() + "'"));

            LocalDateTime now = LocalDateTime.now();

            flashcardSet.getFlashcards().clear();
            entityManager.flush();

            System.out.println("Cleared all flashcards, now adding from request...");

            int counter = 0;
            for (FlashcardItemDTO dto : request.getFlashcards()) {
                long flashcardId = dto.getFlashcardId() != null
                        ? dto.getFlashcardId()
                        : System.currentTimeMillis() * 1000 + counter++;

                FlashCardItem flashcard = new FlashCardItem();
                flashcard.setFlashcardId(flashcardId);
                flashcard.setTitle(dto.getTitle());
                flashcard.setDescription(dto.getDescription());
                flashcard.setCreatedAt(now);
                flashcard.setUpdatedAt(now);

                flashcardSet.addFlashcard(flashcard);
                System.out.println("Added flashcard id=" + flashcardId + " title='" + dto.getTitle() + "' description='"
                        + dto.getDescription() + "'");
            }

            System.out.println("Updated flashcards. Count: " + flashcardSet.getFlashcards().size());
        }

        FlashcardSet saved = flashcardSetRepository.save(flashcardSet);
        entityManager.flush();
        entityManager.refresh(saved);

        System.out.println("Saved flashcard set id=" + saved.getStudySetId() + " with " + saved.getFlashcards().size()
                + " flashcards");
        System.out.println("Final flashcards after save:");
        saved.getFlashcards().forEach(f -> System.out.println("  saved: id=" + f.getFlashcardId() + ", title='"
                + f.getTitle() + "', description='" + f.getDescription() + "'"));

        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteFlashcardSet(Long studySetId) {
        FlashcardSet flashcardSet = flashcardSetRepository.findById(studySetId)
            .orElseThrow(() -> new RuntimeException("Flashcard set not found with id: " + studySetId));

        // Remove any community posts tied to this flashcard set via slug prefix (e.g.,
        // flashcard-{id}-...)
        deleteCommunityPostsForSlug("flashcard-" + studySetId);
        if (flashcardSet.getSlug() != null) {
            deleteCommunityPostsForSlug(flashcardSet.getSlug());
        }

        // SOFT DELETE
        flashcardSet.setDeleted(true);
        flashcardSetRepository.save(flashcardSet);

        System.out.println("Soft deleted flashcard set with ID: " + studySetId);
    }

    @Override
    @Transactional
    public FlashCardItem addFlashcardToSet(Long studySetId, FlashcardItemRequest flashcardRequest) {
        FlashcardSet flashcardSet = flashcardSetRepository.findById(studySetId)
                .orElseThrow(() -> new RuntimeException("Flashcard set not found with id: " + studySetId));

        long flashcardId = System.currentTimeMillis() * 1000 + System.nanoTime() % 1000;

        FlashCardItem flashcard = new FlashCardItem();
        flashcard.setFlashcardId(flashcardId);
        flashcard.setTitle(flashcardRequest.getTitle());
        flashcard.setDescription(flashcardRequest.getDescription());

        LocalDateTime now = LocalDateTime.now();
        flashcard.setCreatedAt(now);
        flashcard.setUpdatedAt(now);

        // Add flashcard to the set (sets bidirectional relationship)
        flashcardSet.addFlashcard(flashcard);

        // Save the set (will cascade save the new flashcard)
        flashcardSetRepository.save(flashcardSet);

        System.out.println("Added flashcard with ID: " + flashcardId + " to set: " + studySetId);

        return flashcard;
    }

    @Override
    @Transactional
    public FlashCardItem updateFlashcard(Long flashcardId, FlashcardItemRequest flashcardRequest) {
        // Find the flashcard set that contains this flashcard
        FlashcardSet flashcardSet = flashcardSetRepository.findAll().stream()
                .filter(set -> set.getFlashcards().stream()
                        .anyMatch(f -> f.getFlashcardId().equals(flashcardId)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Flashcard not found with id: " + flashcardId));

        // Find and update the flashcard
        FlashCardItem flashcard = flashcardSet.getFlashcards().stream()
                .filter(f -> f.getFlashcardId().equals(flashcardId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Flashcard not found with id: " + flashcardId));

        flashcard.setTitle(flashcardRequest.getTitle());
        flashcard.setDescription(flashcardRequest.getDescription());
        flashcard.setUpdatedAt(LocalDateTime.now());

        // Save the set (will cascade save the updated flashcard)
        flashcardSetRepository.save(flashcardSet);

        System.out.println("Updated flashcard with ID: " + flashcardId);

        return flashcard;
    }

    @Override
    @Transactional
    public void deleteFlashcard(Long flashcardId) {
        // Find the flashcard set that contains this flashcard
        FlashcardSet flashcardSet = flashcardSetRepository.findAll().stream()
                .filter(set -> set.getFlashcards().stream()
                        .anyMatch(f -> f.getFlashcardId().equals(flashcardId)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Flashcard not found with id: " + flashcardId));

        // Remove the flashcard from the set
        FlashCardItem flashcardToRemove = flashcardSet.getFlashcards().stream()
                .filter(f -> f.getFlashcardId().equals(flashcardId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Flashcard not found with id: " + flashcardId));

        // Remove from collection (will cascade delete due to orphanRemoval=true)
        flashcardSet.removeFlashcard(flashcardToRemove);

        // Save the set (cascade delete happens automatically)
        flashcardSetRepository.save(flashcardSet);

        System.out.println("Deleted flashcard with ID: " + flashcardId);
    }

    private void deleteCommunityPostsForSlug(String slugPrefix) {
        postRepository.deleteBySlugStartingWith(slugPrefix);
        System.out.println("Deleted community posts with slug prefix: " + slugPrefix);
    }

    // Helper methods
    private String generateSlug(String title, Long studySetId) {
        if (title == null || title.trim().isEmpty()) {
            return "flashcard-set-" + studySetId;
        }

        String baseSlug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (baseSlug.isEmpty()) {
            baseSlug = "flashcard-set";
        }

        return baseSlug + "-" + studySetId;
    }

    private FlashcardSetResponse convertToResponse(FlashcardSet flashcardSet) {
        FlashcardSetResponse response = new FlashcardSetResponse();
        response.setStudySetId(flashcardSet.getStudySetId());
        response.setUserId(flashcardSet.getUserId());
        response.setTitle(flashcardSet.getTitle());
        response.setDescription(flashcardSet.getDescription());
        response.setPublic(flashcardSet.isPublic());
        response.setSlug(flashcardSet.getSlug());

        List<FlashcardResponseDTO> flashcards = flashcardSet.getFlashcards().stream()
                .sorted((f1, f2) -> {
                    if (f1.getCreatedAt() == null && f2.getCreatedAt() == null) return 0;
                    if (f1.getCreatedAt() == null) return 1;
                    if (f2.getCreatedAt() == null) return -1;
                    return f1.getCreatedAt().compareTo(f2.getCreatedAt());
                })
                .map(f -> new FlashcardResponseDTO(
                        f.getFlashcardId(),
                        flashcardSet.getStudySetId(),
                        f.getTitle(),
                        f.getDescription()))
                .collect(Collectors.toList());

        response.setFlashcards(flashcards);

        return response;
    }
}