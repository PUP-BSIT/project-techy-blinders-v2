package com.mindstack.mind_stack_id.Models.dto;

public class CommentDTO {
    private long flashcardId;
    private String content;
    private long userId;

    public CommentDTO() {}

    public CommentDTO(long flashcardId, String content, long userId) {
        this.flashcardId = flashcardId;
        this.content = content;
        this.userId = userId;
    }

    public long getFlashcardId() {
        return flashcardId;
    }

    public String getContent() {
        return content;
    }

    public long getUserId() {
        return userId;
    }
}
