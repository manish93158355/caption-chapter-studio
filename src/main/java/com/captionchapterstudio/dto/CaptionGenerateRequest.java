package com.captionchapterstudio.dto;

import jakarta.validation.constraints.NotBlank;

public class CaptionGenerateRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    private String platform = "Instagram";
    private String tone = "Professional";
    private String length = "Medium";
    private Boolean includeHashtags = true;
    private Boolean hashtagEnabled = true;
    private Integer seed = 0; // for randomizing variations / "Generate More"

    public CaptionGenerateRequest() {}

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

    public String getLength() {
        return length;
    }

    public void setLength(String length) {
        this.length = length;
    }

    public Boolean getIncludeHashtags() {
        if (hashtagEnabled != null) {
            return hashtagEnabled;
        }
        return includeHashtags != null ? includeHashtags : true;
    }

    public void setIncludeHashtags(Boolean includeHashtags) {
        this.includeHashtags = includeHashtags;
        this.hashtagEnabled = includeHashtags;
    }

    public Boolean getHashtagEnabled() {
        return getIncludeHashtags();
    }

    public void setHashtagEnabled(Boolean hashtagEnabled) {
        this.hashtagEnabled = hashtagEnabled;
        this.includeHashtags = hashtagEnabled;
    }

    public Integer getSeed() {
        return seed != null ? seed : 0;
    }

    public void setSeed(Integer seed) {
        this.seed = seed;
    }
}
