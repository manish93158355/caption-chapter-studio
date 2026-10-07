package com.captionchapterstudio.dto;

import jakarta.validation.constraints.NotBlank;

public class CaptionRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Platform is required")
    private String platform;

    @NotBlank(message = "Tone is required")
    private String tone;

    @NotBlank(message = "Content is required")
    private String content;

    private Boolean favorite = false;

    public CaptionRequest() {}

    public CaptionRequest(String topic, String platform, String tone, String content, Boolean favorite) {
        this.topic = topic;
        this.platform = platform;
        this.tone = tone;
        this.content = content;
        this.favorite = favorite != null ? favorite : false;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
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
