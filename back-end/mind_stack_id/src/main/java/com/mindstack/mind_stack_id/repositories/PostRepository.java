package com.mindstack.mind_stack_id.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.PostCreation.CategoryType;

@Repository
public interface PostRepository extends JpaRepository<PostCreation, Long> {
    List<PostCreation> findByUserId(long userId);

    List<PostCreation> findByCategory(CategoryType category);

    List<PostCreation> findByIsPublished(boolean isPublished);

    List<PostCreation> findByUserIdAndIsPublished(long userId, boolean isPublished);

    List<PostCreation> findByCategoryAndIsPublished(CategoryType category, boolean isPublished);

    void deleteBySlugStartingWith(String slugPrefix);
}