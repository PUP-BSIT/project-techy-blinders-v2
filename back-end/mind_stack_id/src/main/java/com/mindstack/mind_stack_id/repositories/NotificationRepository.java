package com.mindstack.mind_stack_id.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mindstack.mind_stack_id.models.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(long userId);

    List<Notification> findByUserIdAndIsReadFalse(long userId);

    List<Notification> findByType(String type);

    List<Notification> findByUserIdAndType(long userId, String type);

    long countByUserIdAndIsReadFalse(long userId);

    @Modifying
    @Query("update Notification n set n.isRead = true where n.notifId = :id")
    int markAsReadById(@Param("id") long id);

    @Modifying
    @Query("delete from Notification n where n.actorUserId = :actorUserId and n.postId = :postId and n.commentId is null and n.type in :types")
    int deleteByActorAndPostAndTypes(@Param("actorUserId") Long actorUserId, @Param("postId") Long postId,
            @Param("types") List<String> types);

    @Modifying
    @Query("delete from Notification n where n.actorUserId = :actorUserId and n.commentId = :commentId and n.type in :types")
    int deleteByActorAndCommentAndTypes(@Param("actorUserId") Long actorUserId, @Param("commentId") Long commentId,
            @Param("types") List<String> types);

    @Modifying
    @Query("delete from Notification n where n.postId = :postId")
    int deleteByPostId(@Param("postId") Long postId);

    @Modifying
    @Query("delete from Notification n where n.commentId = :commentId")
    int deleteByCommentId(@Param("commentId") Long commentId);
}