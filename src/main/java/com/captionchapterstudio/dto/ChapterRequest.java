package com.captionchapterstudio.dto;

import jakarta.validation.constraints.NotBlank;

public class ChapterRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;

    @NotBlank(message = "Content is required")
    private String content;

    private Boolean favorite = false;

    public ChapterRequest() {}

    public ChapterRequest(String title, String category, String description, String content, Boolean favorite) {
        this.title = title;
        this.category = category;
        this.description = description;
        this.content = content;
        this.favorite = favorite != null ? favorite : false;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Boolean getFavorite() {
        return favorite;
    }

    public void setFavorite(Boolean favorite) {
        this.favorite = favorite;
    }
}
