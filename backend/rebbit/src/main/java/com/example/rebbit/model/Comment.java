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
    @JsonIgnore // Prevent circular reference in JSON
    private Post post;

    public void setPost(Post post) { this.post = post; }
    public Post getPost() { return post; }
}