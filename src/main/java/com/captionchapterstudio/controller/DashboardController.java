package com.captionchapterstudio.controller;

import com.captionchapterstudio.dto.ApiResponse;
import com.captionchapterstudio.dto.DashboardStatsResponse;
import com.captionchapterstudio.service.ChapterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ChapterService chapterService;

    public DashboardController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        DashboardStatsResponse stats = chapterService.getDashboardStats(userId);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics retrieved", stats));
    }
}
