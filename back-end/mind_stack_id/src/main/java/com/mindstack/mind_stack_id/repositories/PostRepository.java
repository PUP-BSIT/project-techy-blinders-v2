package com.mindstack.mind_stack_id.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
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

    @Modifying
    void deleteBySlugStartingWith(String slugPrefix);

    @Query("SELECT p FROM PostCreation p WHERE p.isPublished = true AND (p.isDeleted IS NULL OR p.isDeleted = false)")
    List<PostCreation> findPublishedAndNotDeleted();
}