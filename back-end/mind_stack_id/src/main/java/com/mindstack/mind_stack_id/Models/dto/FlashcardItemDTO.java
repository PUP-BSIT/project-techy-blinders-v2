package com.mindstack.mind_stack_id.models.dto;

public class FlashcardItemDTO {
    private Long flashcardId;
    private String title;
    private String description;

    public FlashcardItemDTO() {}

    public FlashcardItemDTO(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public FlashcardItemDTO(Long flashcardId, String title, String description) {
        this.flashcardId = flashcardId;
        this.title = title;
        this.description = description;
    }

    public Long getFlashcardId() {
        return flashcardId;
    }

    public void setFlashcardId(Long flashcardId) {
        this.flashcardId = flashcardId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
