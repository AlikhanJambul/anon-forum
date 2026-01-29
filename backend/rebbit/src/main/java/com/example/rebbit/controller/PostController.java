package com.example.rebbit.controller;

import com.example.rebbit.model.Post;
import com.example.rebbit.model.Comment;
import com.example.rebbit.repository.PostRepository;
import com.example.rebbit.repository.CommentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public List<Post> getAllPosts() {
        logger.info("Fetching all posts sorted by creation date");
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping
    public Post addPost(@RequestBody Post post) {
        logger.info("Adding new post with title: {}", post.getTitle());
        return postRepository.save(post);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable String id) {
        logger.info("Deleting post with id: {}", id);
        postRepository.deleteById(id);
    }

    @PostMapping("/{postId}/comments")
    public Comment addComment(@PathVariable String postId, @RequestBody Comment comment) {
        logger.info("Adding comment to post id: {}", postId);
        Post post = postRepository.findById(postId).orElseThrow(() -> {
            logger.error("Post with id {} not found", postId);
            return new RuntimeException("Post not found");
        });
        comment.setPost(post);
        return commentRepository.save(comment);
    }

    @PatchMapping("/{postId}/vote")
    public Post votePost(@PathVariable String postId, @RequestParam int value) {
        logger.info("Voting on post id: {} with value: {}", postId, value);
        Post post = postRepository.findById(postId).orElseThrow(() -> {
            logger.error("Post with id {} not found for voting", postId);
            return new RuntimeException("Post not found");
        });
        post.setUpvotes(post.getUpvotes() + value);
        return postRepository.save(post);
    }
}