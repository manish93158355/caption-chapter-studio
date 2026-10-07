package com.captionchapterstudio.controller;

import com.captionchapterstudio.dto.ApiResponse;
import com.captionchapterstudio.dto.ChapterRequest;
import com.captionchapterstudio.model.Chapter;
import com.captionchapterstudio.service.ChapterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chapters")
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Chapter>> createChapter(
            HttpServletRequest request,
            @Valid @RequestBody ChapterRequest chapterRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Chapter created = chapterService.createChapter(userId, chapterRequest);
        return ResponseEntity.ok(ApiResponse.ok("Chapter created successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Chapter>>> getChapters(
            HttpServletRequest request,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean favorite) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        List<Chapter> chapters = chapterService.getUserChapters(userId, category, search, favorite);
        return ResponseEntity.ok(ApiResponse.ok("Chapters retrieved successfully", chapters));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Chapter>> getChapterById(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Chapter chapter = chapterService.getChapterById(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Chapter found", chapter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Chapter>> updateChapter(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody ChapterRequest chapterRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Chapter updated = chapterService.updateChapter(userId, id, chapterRequest);
        return ResponseEntity.ok(ApiResponse.ok("Chapter updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        chapterService.deleteChapter(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Chapter deleted successfully"));
    }

    @PutMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<Chapter>> toggleFavorite(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Chapter updated = chapterService.toggleFavorite(userId, id);
        String msg = Boolean.TRUE.equals(updated.getFavorite()) ? "Added to favorites" : "Removed from favorites";
        return ResponseEntity.ok(ApiResponse.ok(msg, updated));
    }
}
