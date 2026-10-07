package com.captionchapterstudio.dto;

import java.util.ArrayList;
import java.util.List;

public class CaptionGenerateResponse {

    public static class CaptionOption {
        private String content;
        private List<String> hashtags;
        private String formattedHashtags;

        public CaptionOption() {
            this.hashtags = new ArrayList<>();
        }

        public CaptionOption(String content, List<String> hashtags) {
            this.content = content;
            this.hashtags = hashtags != null ? hashtags : new ArrayList<>();
            this.formattedHashtags = String.join(" ", this.hashtags);
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public List<String> getHashtags() {
            return hashtags;
        }

        public void setHashtags(List<String> hashtags) {
            this.hashtags = hashtags;
            this.formattedHashtags = hashtags != null ? String.join(" ", hashtags) : "";
        }

        public String getFormattedHashtags() {
            return formattedHashtags;
        }

        public void setFormattedHashtags(String formattedHashtags) {
            this.formattedHashtags = formattedHashtags;
        }
    }

    private List<CaptionOption> captions = new ArrayList<>();
    private String primaryCaption;
    private String alternativeCaption;
    private List<String> hashtags;
    private String formattedHashtags;
    private String platform;
    private String tone;
    private String length;

    public CaptionGenerateResponse() {}

    public CaptionGenerateResponse(List<CaptionOption> captions, String platform, String tone, String length) {
        this.captions = captions != null ? captions : new ArrayList<>();
        this.platform = platform;
        this.tone = tone;
        this.length = length;
        if (!this.captions.isEmpty()) {
            this.primaryCaption = this.captions.get(0).getContent();
            this.hashtags = this.captions.get(0).getHashtags();
            this.formattedHashtags = this.captions.get(0).getFormattedHashtags();
            if (this.captions.size() > 1) {
                this.alternativeCaption = this.captions.get(1).getContent();
            }
        }
    }

    public List<CaptionOption> getCaptions() {
        return captions;
    }

    public void setCaptions(List<CaptionOption> captions) {
        this.captions = captions;
    }

    public String getPrimaryCaption() {
        return primaryCaption;
    }

    public void setPrimaryCaption(String primaryCaption) {
        this.primaryCaption = primaryCaption;
    }

    public String getAlternativeCaption() {
        return alternativeCaption;
    }

    public void setAlternativeCaption(String alternativeCaption) {
        this.alternativeCaption = alternativeCaption;
    }

    public List<String> getHashtags() {
        return hashtags;
    }

    public void setHashtags(List<String> hashtags) {
        this.hashtags = hashtags;
    }

    public String getFormattedHashtags() {
        return formattedHashtags;
    }

    public void setFormattedHashtags(String formattedHashtags) {
        this.formattedHashtags = formattedHashtags;
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
}
