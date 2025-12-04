package com.mindstack.mind_stack_id.services;

import java.util.List;
import com.mindstack.mind_stack_id.models.FlashcardCreation;
import com.mindstack.mind_stack_id.models.dto.FlashcardDTO;

public interface FlashCardService {
    List<FlashcardDTO> getAllFlashcards();
    FlashcardCreation getFlashcardById(Long id);
    FlashcardCreation createFlashcard(FlashcardCreation flashcard);
    FlashcardCreation updateFlashcard(Long id, FlashcardCreation flashcardDetails);
    void deleteFlashcard(Long id);
    void deleteStudySet(Long studySetId);
    List<FlashcardCreation> getFlashcardsByUserId(Long userId);
}