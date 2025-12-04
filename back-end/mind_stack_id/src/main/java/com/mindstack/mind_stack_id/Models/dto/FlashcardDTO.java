package com.mindstack.mind_stack_id.models.dto;

public class FlashcardDTO {
    private long studySetId;
    private long flashcardId;
    private String title;
    private String description;

    public FlashcardDTO(){}

    public FlashcardDTO( long studySetId, long flashcardId, String title, String description) {
        this.studySetId = studySetId;
        this.flashcardId = flashcardId;
        this.title = title;
        this.description = description;
    }

    public long getStudySetId() {
        return studySetId;
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
