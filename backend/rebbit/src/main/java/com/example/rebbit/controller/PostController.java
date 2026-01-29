package com.example.rebbit.controller;

import com.example.rebbit.model.Post;
import com.example.rebbit.model.Comment;
import com.example.rebbit.repository.PostRepository;
import com.example.rebbit.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping
    public Post addPost(@RequestBody Post post) {
        return postRepository.save(post);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable String id) {
        postRepository.deleteById(id);
    }

    @PostMapping("/{postId}/comments")
    public Comment addComment(@PathVariable String postId, @RequestBody Comment comment) {
        Post post = postRepository.findById(postId).orElseThrow();
        comment.setPost(post);
        return commentRepository.save(comment);
    }

    @PatchMapping("/{postId}/vote")
    public Post votePost(@PathVariable String postId, @RequestParam int value) {
        Post post = postRepository.findById(postId).orElseThrow();
        post.setUpvotes(post.getUpvotes() + value);
        return postRepository.save(post);
    }
}