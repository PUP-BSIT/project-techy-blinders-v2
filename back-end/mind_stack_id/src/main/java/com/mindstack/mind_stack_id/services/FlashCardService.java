package com.mindstack.mind_stack_id.services;

import java.util.List;

import com.mindstack.mind_stack_id.models.FlashCardItem;
import com.mindstack.mind_stack_id.models.dto.CreateFlashcardSetRequest;
import com.mindstack.mind_stack_id.models.dto.FlashcardItemRequest;
import com.mindstack.mind_stack_id.models.dto.FlashcardSetResponse;

public interface FlashCardService {
    
    FlashcardSetResponse createFlashcardSet(CreateFlashcardSetRequest request);
    FlashcardSetResponse getFlashcardSetById(Long studySetId);
    FlashcardSetResponse getFlashcardSetBySlug(String slug);
    List<FlashcardSetResponse> getFlashcardSetsByUserId(Long userId);
    List<FlashcardSetResponse> getAllPublicFlashcardSets();
    FlashcardSetResponse updateFlashcardSet(Long studySetId, CreateFlashcardSetRequest request);
    void deleteFlashcardSet(Long studySetId);
    
    FlashCardItem addFlashcardToSet(Long studySetId, FlashcardItemRequest flashcardRequest);
    FlashCardItem updateFlashcard(Long flashcardId, FlashcardItemRequest flashcardRequest);
    void deleteFlashcard(Long flashcardId);
}