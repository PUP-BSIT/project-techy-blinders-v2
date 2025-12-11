package com.mindstack.mind_stack_id.models;

import java.io.Serializable;
import java.util.Objects;

public class CommentReactionId implements Serializable {
    private long commentId;
    private long userId;

    public CommentReactionId() {}

    public CommentReactionId(long commentId, long userId) {
        this.commentId = commentId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CommentReactionId that = (CommentReactionId) o;
        return commentId == that.commentId && userId == that.userId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(commentId, userId);
    }
}
