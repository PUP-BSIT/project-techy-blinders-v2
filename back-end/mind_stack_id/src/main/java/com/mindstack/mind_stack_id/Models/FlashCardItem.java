package com.mindstack.mind_stack_id.models;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_flashcard")
public class FlashCardItem {
    
    @Id 
    @Column(name = "flashcard_id")
    private Long flashcardId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_set_id", nullable = false)
    private FlashcardSet flashcardSet;
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public FlashCardItem() {}
    
    public FlashCardItem(Long flashcardId, String title, String description) {
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
    
    public FlashcardSet getFlashcardSet() {
        return flashcardSet;
    }
    
    public void setFlashcardSet(FlashcardSet flashcardSet) {
        this.flashcardSet = flashcardSet;
    }
    
    public Long getStudySetId() {
        return flashcardSet != null ? flashcardSet.getStudySetId() : null;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}