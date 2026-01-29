package com.example.rebbit.repository;
import com.example.rebbit.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, String> {}