package com.mindstack.mind_stack_id.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.mindstack.mind_stack_id.models.Rating;
import java.util.List;

public interface RatingRepostory extends JpaRepository<Rating, Long>{
    List<Rating> findByCommentId(long commentId);
    List<Rating> findByUserId(long userId);
    void deleteByCommentId(long commentId);
}
