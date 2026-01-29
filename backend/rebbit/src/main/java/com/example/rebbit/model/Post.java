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

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
}

