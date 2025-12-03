package com.mindstack.mind_stack_id.services.implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mindstack.mind_stack_id.models.PostCreation;
import com.mindstack.mind_stack_id.models.PostCreation.CategoryType;
import com.mindstack.mind_stack_id.models.dto.PostDTO;
import com.mindstack.mind_stack_id.repositories.PostRepository;
import com.mindstack.mind_stack_id.services.PostService;

@Service
public class PostImplementation implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Override
    public PostCreation createPost(PostCreation post) {
        long randomPostId = ThreadLocalRandom.current().nextLong(1000000000L, 10000000000L);
        post.setPostId(randomPostId);
        
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        
        if (post.getPublish() == null) {
            post.setPublish(false);
        }
        
        System.out.println("Created post with ID: " + post.getPostId());
        
        return postRepository.save(post);
    }

    @Override
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll()
                .stream()
                .map(f -> new PostDTO(
                        f.getPostId(),
                        f.getUserId(),
                        f.getTitle(),
                        f.getCreatedAt(),
                        f.getUpdatedAt()
                ))
                .toList();
    }

    @Override
    public PostCreation getPostById(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        return post.orElse(null);
    }

    @Override
    public List<PostDTO> getPostsByUserId(long userId) {
        return postRepository.findByUserId(userId)
                .stream()
                .map(f -> new PostDTO(
                        f.getPostId(),
                        f.getUserId(),
                        f.getTitle(),
                        f.getCreatedAt(),
                        f.getUpdatedAt()
                ))
                .toList();
    }

    @Override
    public List<PostDTO> getPostsByCategory(String category) {
        CategoryType categoryType = CategoryType.fromValue(category);
        return postRepository.findByCategory(categoryType)
                .stream()
                .map(f -> new PostDTO(
                        f.getPostId(),
                        f.getUserId(),
                        f.getTitle(),
                        f.getCreatedAt(),
                        f.getUpdatedAt()
                ))
                .toList();
    }

    @Override
    public List<PostDTO> getPublishedPosts() {
        return postRepository.findByIsPublished(true)
                .stream()
                .map(f -> new PostDTO(
                        f.getPostId(),
                        f.getUserId(),
                        f.getTitle(),
                        f.getCreatedAt(),
                        f.getUpdatedAt()
                ))
                .toList();
    }

    @Override
    public PostCreation updatePost(long id, PostCreation post) {
        Optional<PostCreation> existingPost = postRepository.findById(id);
        if (existingPost.isPresent()) {
            PostCreation updatedPost = existingPost.get();
            updatedPost.setTitle(post.getTitle());
            updatedPost.setContent(post.getContent());
            updatedPost.setSlug(post.getSlug());
            updatedPost.setCategory(post.getCategory());
            updatedPost.setPublish(post.getPublish());
            updatedPost.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Updated post with ID: " + updatedPost.getPostId());
            
            return postRepository.save(updatedPost);
        }
        
        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    public boolean deletePost(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            postRepository.deleteById(id);
            System.out.println("Deleted post with ID: " + id);
            return true;
        }
        
        System.out.println("Post not found: " + id);
        return false;
    }

    @Override
    public PostCreation publishPost(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            PostCreation publishedPost = post.get();
            publishedPost.setPublish(true);
            publishedPost.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Published post with ID: " + publishedPost.getPostId());
            
            return postRepository.save(publishedPost);
        }
        
        System.out.println("Post not found: " + id);
        return null;
    }

    @Override
    public PostCreation unpublishPost(long id) {
        Optional<PostCreation> post = postRepository.findById(id);
        if (post.isPresent()) {
            PostCreation unpublishedPost = post.get();
            unpublishedPost.setPublish(false);
            unpublishedPost.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Unpublished post with ID: " + unpublishedPost.getPostId());
            
            return postRepository.save(unpublishedPost);
        }
        
        System.out.println("Post not found: " + id);
        return null;
    }
}