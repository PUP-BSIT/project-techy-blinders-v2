package com.mindstack.mind_stack_id.services;

import java.util.List;

import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.dto.PostDTO;

public interface PostService {

    PostCreation createPost(PostCreation post);

    List<PostDTO> getAllPosts(Long userId);

    PostCreation getPostById(long id);

    List<PostDTO> getPostsByUserId(long userId);

    List<PostDTO> getPostsByCategory(String category);

    List<PostDTO> getPublishedPosts();

    PostCreation updatePost(long id, PostCreation post);

    boolean deletePost(long id);

    PostCreation publishPost(long id);

    PostCreation unpublishPost(long id, boolean setPrivate, Long actorUserId);

    PostDTO likePost(long id, Long userId);

    PostDTO dislikePost(long id, Long userId);
}