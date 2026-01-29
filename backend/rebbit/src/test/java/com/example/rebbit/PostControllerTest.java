package com.example.rebbit;

import com.example.rebbit.controller.PostController;
import com.example.rebbit.model.Comment;
import com.example.rebbit.model.Post;
import com.example.rebbit.repository.CommentRepository;
import com.example.rebbit.repository.PostRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PostController.class)
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostRepository postRepository;

    @MockBean
    private CommentRepository commentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // Тест 1: Получение всех постов (Успех)
    @Test
    void getAllPosts_ShouldReturnList() throws Exception {
        Post post1 = new Post();
        post1.setId("1");
        post1.setTitle("Title 1");

        Post post2 = new Post();
        post2.setId("2");
        post2.setTitle("Title 2");

        when(postRepository.findAll(any(Sort.class))).thenReturn(Arrays.asList(post1, post2));

        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()", is(2)))
                .andExpect(jsonPath("$[0].title", is("Title 1")))
                .andExpect(jsonPath("$[1].title", is("Title 2")));
    }

    // Тест 2: Получение пустого списка постов
    @Test
    void getAllPosts_WhenEmpty_ShouldReturnEmptyList() throws Exception {
        when(postRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()", is(0)));
    }

    // Тест 3: Добавление нового поста
    @Test
    void addPost_ShouldReturnSavedPost() throws Exception {
        Post post = new Post();
        post.setTitle("New Post");
        post.setAuthor("User");

        when(postRepository.save(any(Post.class))).thenReturn(post);

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(post)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("New Post")));
    }

    // Тест 4: Удаление поста
    @Test
    void deletePost_ShouldCallRepository() throws Exception {
        String postId = "123";
        doNothing().when(postRepository).deleteById(postId);

        mockMvc.perform(delete("/api/posts/{id}", postId))
                .andExpect(status().isOk());

        verify(postRepository, times(1)).deleteById(postId);
    }

    // Тест 5: Добавление комментария (Успех)
    @Test
    void addComment_Success() throws Exception {
        String postId = "1";
        Post post = new Post();
        post.setId(postId);

        Comment comment = new Comment();
        comment.setText("Nice post!");

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(commentRepository.save(any(Comment.class))).thenReturn(comment);

        mockMvc.perform(post("/api/posts/{postId}/comments", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(comment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text", is("Nice post!")));
    }

    // Тест 6: Добавление комментария к несуществующему посту (Ошибка 500 или 404)
    @Test
    void addComment_PostNotFound_ShouldFail() throws Exception {
        String postId = "999";
        Comment comment = new Comment();
        comment.setText("Fail comment");

        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/posts/{postId}/comments", postId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(comment)))
                .andExpect(status().isNotFound()); // ТЕПЕРЬ ОЖИДАЕМ 404
    }

    // Тест 7: Голосование за пост (Лайк)
    @Test
    void votePost_Upvote_Success() throws Exception {
        String postId = "1";
        Post post = new Post();
        post.setId(postId);
        post.setUpvotes(10);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(patch("/api/posts/{postId}/vote", postId)
                        .param("value", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upvotes", is(11)));
    }

    // Тест 8: Голосование за пост (Дизлайк)
    @Test
    void votePost_Downvote_Success() throws Exception {
        String postId = "1";
        Post post = new Post();
        post.setId(postId);
        post.setUpvotes(10);

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(patch("/api/posts/{postId}/vote", postId)
                        .param("value", "-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.upvotes", is(9)));
    }

    // Тест 9: Голосование за несуществующий пост
    @Test
    void votePost_PostNotFound_ShouldFail() throws Exception {
        String postId = "999";
        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/api/posts/{postId}/vote", postId)
                        .param("value", "1"))
                .andExpect(status().isNotFound()); // ТЕПЕРЬ ОЖИДАЕМ 404
    }

    // Тест 10: Проверка сериализации JSON при добавлении поста
    @Test
    void addPost_CheckJsonSerialization() throws Exception {
        // Проверяем, что поля category и content корректно маппятся
        String jsonContent = "{\"title\":\"Test Title\", \"content\":\"Test Content\", \"category\":\"Tech\"}";

        Post savedPost = new Post();
        savedPost.setTitle("Test Title");
        savedPost.setContent("Test Content");
        savedPost.setCategory("Tech");

        when(postRepository.save(any(Post.class))).thenReturn(savedPost);

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonContent))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", is("Test Content")))
                .andExpect(jsonPath("$.category", is("Tech")));
    }
}