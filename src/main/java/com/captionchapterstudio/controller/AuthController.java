package com.captionchapterstudio.controller;

import com.captionchapterstudio.dto.ApiResponse;
import com.captionchapterstudio.dto.AuthResponse;
import com.captionchapterstudio.dto.LoginRequest;
import com.captionchapterstudio.dto.RegisterRequest;
import com.captionchapterstudio.dto.UserProfileUpdateRequest;
import com.captionchapterstudio.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getCurrentUser(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        AuthResponse.UserDto user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("User profile retrieved", user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> updateProfile(
            HttpServletRequest request,
            @Valid @RequestBody UserProfileUpdateRequest updateRequest) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        AuthResponse.UserDto updatedUser = authService.updateProfile(userId, updateRequest);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updatedUser));
    }
}
