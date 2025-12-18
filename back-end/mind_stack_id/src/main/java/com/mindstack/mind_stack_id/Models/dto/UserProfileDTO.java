package com.mindstack.mind_stack_id.models.dto;

public class UserProfileDTO {
    private String username;
    private long userId;
    private String email;
    private long quizzesCreated;
    private long flashcardSetsCreated;
    private long totalLikes;

    public UserProfileDTO() {
    }

    public UserProfileDTO(String username, long userId, String email, long quizzesCreated, long flashcardSetsCreated,
            long totalLikes) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.quizzesCreated = quizzesCreated;
        this.flashcardSetsCreated = flashcardSetsCreated;
        this.totalLikes = totalLikes;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public long getQuizzesCreated() {
        return quizzesCreated;
    }

    public void setQuizzesCreated(long quizzesCreated) {
        this.quizzesCreated = quizzesCreated;
    }

    public long getFlashcardSetsCreated() {
        return flashcardSetsCreated;
    }

    public void setFlashcardSetsCreated(long flashcardSetsCreated) {
        this.flashcardSetsCreated = flashcardSetsCreated;
    }

    public long getTotalLikes() {
        return totalLikes;
    }

    public void setTotalLikes(long totalLikes) {
        this.totalLikes = totalLikes;
    }
}
