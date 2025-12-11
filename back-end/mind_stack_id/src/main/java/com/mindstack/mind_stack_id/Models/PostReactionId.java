package com.mindstack.mind_stack_id.models;

import java.io.Serializable;
import java.util.Objects;

public class PostReactionId implements Serializable {
    private long postId;
    private long userId;

    public PostReactionId() {}

    public PostReactionId(long postId, long userId) {
        this.postId = postId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PostReactionId that = (PostReactionId) o;
        return postId == that.postId && userId == that.userId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, userId);
    }
}
