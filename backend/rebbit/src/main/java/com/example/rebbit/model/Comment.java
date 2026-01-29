package com.example.rebbit.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    private String id;
    private String text;
    private String author;
    private String createdAt;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnore // Этот аннотация важна, чтобы не было зацикливания JSON
    private Post post;

    // --- ОБЯЗАТЕЛЬНЫЕ ГЕТТЕРЫ И СЕТТЕРЫ ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
}