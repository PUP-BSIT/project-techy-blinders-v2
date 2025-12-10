package com.mindstack.mind_stack_id.models.dto;

public class FlashcardResponseDTO {
    private Long flashcardId;
    private Long studySetId;
    private String title;
    private String description;

    public FlashcardResponseDTO() {}

    public FlashcardResponseDTO(Long flashcardId, Long studySetId, String title, String description) {
        this.flashcardId = flashcardId;
        this.studySetId = studySetId;
        this.title = title;
        this.description = description;
    }

    public Long getFlashcardId() {
        return flashcardId;
    }

    public void setFlashcardId(Long flashcardId) {
        this.flashcardId = flashcardId;
    }

    public Long getStudySetId() {
        return studySetId;
    }

    public void setStudySetId(Long studySetId) {
        this.studySetId = studySetId;
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
