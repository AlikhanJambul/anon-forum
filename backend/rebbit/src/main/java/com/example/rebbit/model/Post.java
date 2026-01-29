package com.example.rebbit.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    private String id;
    private String title;
    private String content;
    private String author;
    private String category;
    private int upvotes;
    private String createdAt;

    // ВАЖНО: Связь с комментариями
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    // --- ГЕТТЕРЫ И СЕТТЕРЫ (Без них поля не уйдут на фронт) ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    // Самое главное для вашей ошибки:
    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
}