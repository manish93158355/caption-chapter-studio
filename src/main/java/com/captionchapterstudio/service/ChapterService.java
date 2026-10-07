package com.captionchapterstudio.service;

import com.captionchapterstudio.dto.ChapterRequest;
import com.captionchapterstudio.dto.DashboardStatsResponse;
import com.captionchapterstudio.model.Caption;
import com.captionchapterstudio.model.Chapter;
import com.captionchapterstudio.model.User;
import com.captionchapterstudio.repository.CaptionRepository;
import com.captionchapterstudio.repository.ChapterRepository;
import com.captionchapterstudio.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final CaptionRepository captionRepository;
    private final UserRepository userRepository;

    public ChapterService(ChapterRepository chapterRepository, CaptionRepository captionRepository, UserRepository userRepository) {
        this.chapterRepository = chapterRepository;
        this.captionRepository = captionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Chapter createChapter(Long userId, ChapterRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Chapter chapter = new Chapter(
                user,
                req.getTitle().trim(),
                req.getCategory().trim(),
                req.getDescription() != null ? req.getDescription().trim() : "",
                req.getContent().trim(),
                req.getFavorite()
        );

        return chapterRepository.save(chapter);
    }

    public List<Chapter> getUserChapters(Long userId, String category, String search, Boolean favorite) {
        String cleanCategory = (category != null && !category.trim().isEmpty() && !"all".equalsIgnoreCase(category))
                ? category.trim() : null;
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return chapterRepository.searchChapters(userId, cleanCategory, cleanSearch, favorite);
    }

    public Chapter getChapterById(Long userId, Long id) {
        return chapterRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Chapter not found with id: " + id));
    }

    @Transactional
    public Chapter updateChapter(Long userId, Long id, ChapterRequest req) {
        Chapter chapter = getChapterById(userId, id);
        chapter.setTitle(req.getTitle().trim());
        chapter.setCategory(req.getCategory().trim());
        chapter.setDescription(req.getDescription() != null ? req.getDescription().trim() : "");
        chapter.setContent(req.getContent().trim());
        if (req.getFavorite() != null) {
            chapter.setFavorite(req.getFavorite());
        }
        return chapterRepository.save(chapter);
    }

    @Transactional
    public void deleteChapter(Long userId, Long id) {
        Chapter chapter = getChapterById(userId, id);
        chapterRepository.delete(chapter);
    }

    @Transactional
    public Chapter toggleFavorite(Long userId, Long id) {
        Chapter chapter = getChapterById(userId, id);
        chapter.setFavorite(!Boolean.TRUE.equals(chapter.getFavorite()));
        return chapterRepository.save(chapter);
    }

    public DashboardStatsResponse getDashboardStats(Long userId) {
        long totalCaptions = captionRepository.countByUserId(userId);
        long totalChapters = chapterRepository.countByUserId(userId);
        long favCaptions = captionRepository.countByUserIdAndFavoriteTrue(userId);
        long favChapters = chapterRepository.countByUserIdAndFavoriteTrue(userId);
        long totalFavorites = favCaptions + favChapters;

        // Calculate total words across all user chapters
        List<Chapter> allChapters = chapterRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        long totalWords = 0;
        for (Chapter ch : allChapters) {
            String plainText = stripHtmlTags(ch.getContent());
            String[] words = plainText.trim().split("\\s+");
            if (words.length > 0 && !words[0].isEmpty()) {
                totalWords += words.length;
            }
        }

        // Recent 5 captions and chapters
        List<Caption> allCaptions = captionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Caption> recentCaptions = allCaptions.stream().limit(5).toList();
        List<Chapter> recentChapters = allChapters.stream().limit(5).toList();

        return new DashboardStatsResponse(
                totalCaptions,
                totalChapters,
                totalFavorites,
                totalWords,
                recentCaptions,
                recentChapters
        );
    }

    private String stripHtmlTags(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", " ");
    }
}
