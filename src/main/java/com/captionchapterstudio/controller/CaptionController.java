package com.captionchapterstudio.controller;

import com.captionchapterstudio.dto.ApiResponse;
import com.captionchapterstudio.dto.CaptionGenerateRequest;
import com.captionchapterstudio.dto.CaptionGenerateResponse;
import com.captionchapterstudio.dto.CaptionRequest;
import com.captionchapterstudio.model.Caption;
import com.captionchapterstudio.service.CaptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/captions")
public class CaptionController {

    private final CaptionService captionService;

    public CaptionController(CaptionService captionService) {
        this.captionService = captionService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<CaptionGenerateResponse>> generateCaption(
            @Valid @RequestBody CaptionGenerateRequest request) {
        CaptionGenerateResponse response = captionService.generateCaption(request);
        return ResponseEntity.ok(ApiResponse.ok("Caption generated successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Caption>> createCaption(
            HttpServletRequest request,
            @Valid @RequestBody CaptionRequest captionRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Caption created = captionService.createCaption(userId, captionRequest);
        return ResponseEntity.ok(ApiResponse.ok("Caption saved successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Caption>>> getCaptions(
            HttpServletRequest request,
            @RequestParam(required = false) String platform,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean favorite) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        List<Caption> captions = captionService.getUserCaptions(userId, platform, search, favorite);
        return ResponseEntity.ok(ApiResponse.ok("Captions retrieved successfully", captions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Caption>> getCaptionById(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Caption caption = captionService.getCaptionById(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Caption found", caption));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Caption>> updateCaption(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody CaptionRequest captionRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Caption updated = captionService.updateCaption(userId, id, captionRequest);
        return ResponseEntity.ok(ApiResponse.ok("Caption updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCaption(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        captionService.deleteCaption(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Caption deleted successfully"));
    }

    @PutMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<Caption>> toggleFavorite(
            HttpServletRequest request,
            @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        Caption updated = captionService.toggleFavorite(userId, id);
        String msg = Boolean.TRUE.equals(updated.getFavorite()) ? "Added to favorites" : "Removed from favorites";
        return ResponseEntity.ok(ApiResponse.ok(msg, updated));
    }
}
