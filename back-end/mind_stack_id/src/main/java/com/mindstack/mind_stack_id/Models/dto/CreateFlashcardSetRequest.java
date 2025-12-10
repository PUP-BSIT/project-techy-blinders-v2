package com.mindstack.mind_stack_id.models.dto;

import java.util.List;

public class CreateFlashcardSetRequest {
    private Long userId;
    private String title;
    private String description;
    private boolean isPublic;
    private List<FlashcardItemDTO> flashcards;

    public CreateFlashcardSetRequest() {}

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public List<FlashcardItemDTO> getFlashcards() {
        return flashcards;
    }

    public void setFlashcards(List<FlashcardItemDTO> flashcards) {
        this.flashcards = flashcards;
    }
}