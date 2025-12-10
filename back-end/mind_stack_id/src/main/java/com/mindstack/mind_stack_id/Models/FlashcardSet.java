package com.mindstack.mind_stack_id.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "tbl_flashcard_set")
public class FlashcardSet {
    
    @Id
    @Column(name = "study_set_id")
    private Long studySetId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "is_public")
    private boolean isPublic;
    
    @Column(name = "slug", unique = true)
    private String slug;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Add OneToMany relationship
    @OneToMany(mappedBy = "flashcardSet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FlashCardItem> flashcards = new ArrayList<>();
    
    // Constructors
    public FlashcardSet() {}
    
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
    
    public List<FlashCardItem> getFlashcards() {
        return flashcards;
    }
    
    public void setFlashcards(List<FlashCardItem> flashcards) {
        this.flashcards = flashcards;
    }
    
    public void addFlashcard(FlashCardItem flashcard) {
        flashcards.add(flashcard);
        flashcard.setFlashcardSet(this);
    }
    
    public void removeFlashcard(FlashCardItem flashcard) {
        flashcards.remove(flashcard);
        flashcard.setFlashcardSet(null);
    }
}