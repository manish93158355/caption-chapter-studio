package com.captionchapterstudio.dto;

import com.captionchapterstudio.model.Caption;
import com.captionchapterstudio.model.Chapter;
import java.util.List;

public class DashboardStatsResponse {
    private long totalCaptions;
    private long totalChapters;
    private long totalFavorites;
    private long totalWords;
    private List<Caption> recentCaptions;
    private List<Chapter> recentChapters;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalCaptions, long totalChapters, long totalFavorites, long totalWords, List<Caption> recentCaptions, List<Chapter> recentChapters) {
        this.totalCaptions = totalCaptions;
        this.totalChapters = totalChapters;
        this.totalFavorites = totalFavorites;
        this.totalWords = totalWords;
        this.recentCaptions = recentCaptions;
        this.recentChapters = recentChapters;
    }

    public long getTotalCaptions() {
        return totalCaptions;
    }

    public void setTotalCaptions(long totalCaptions) {
        this.totalCaptions = totalCaptions;
    }

    public long getTotalChapters() {
        return totalChapters;
    }

    public void setTotalChapters(long totalChapters) {
        this.totalChapters = totalChapters;
    }

    public long getTotalFavorites() {
        return totalFavorites;
    }

    public void setTotalFavorites(long totalFavorites) {
        this.totalFavorites = totalFavorites;
    }

    public long getTotalWords() {
        return totalWords;
    }

    public void setTotalWords(long totalWords) {
        this.totalWords = totalWords;
    }

    public List<Caption> getRecentCaptions() {
        return recentCaptions;
    }

    public void setRecentCaptions(List<Caption> recentCaptions) {
        this.recentCaptions = recentCaptions;
    }

    public List<Chapter> getRecentChapters() {
        return recentChapters;
    }

    public void setRecentChapters(List<Chapter> recentChapters) {
        this.recentChapters = recentChapters;
    }
}
