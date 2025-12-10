package com.mindstack.mind_stack_id.models.dto;

import java.util.List;

public class FlashcardSetResponse {
    private Long studySetId;
    private Long userId;
    private String title;
    private String description;
    private boolean isPublic;
    private String slug;
    private List<FlashcardResponseDTO> flashcards;

    public FlashcardSetResponse() {}

    public Long getStudySetId() {
        return studySetId;
    }

    public void setStudySetId(Long studySetId) {
        this.studySetId = studySetId;
    }

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

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public List<FlashcardResponseDTO> getFlashcards() {
        return flashcards;
    }

    public void setFlashcards(List<FlashcardResponseDTO> flashcards) {
        this.flashcards = flashcards;
    }
}