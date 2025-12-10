package com.mindstack.mind_stack_id.models.dto;

public class FlashcardItemDTO {
    private String title;
    private String description;

    public FlashcardItemDTO() {}

    public FlashcardItemDTO(String title, String description) {
        this.title = title;
        this.description = description;
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
