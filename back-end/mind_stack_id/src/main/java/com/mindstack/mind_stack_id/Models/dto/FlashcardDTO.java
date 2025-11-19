package com.mindstack.mind_stack_id.Models.dto;

public class FlashcardDTO {
    private long flashcardId;
    private String title;
    private String description;

    public FlashcardDTO(){}

    public FlashcardDTO(long flashcardId, String title, String description) {
        this.flashcardId = flashcardId;
        this.title = title;
        this.description = description;
    }

    public long getFlashcardById() {
        return flashcardId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }
    
}
