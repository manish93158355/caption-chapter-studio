package com.captionchapterstudio.service;

import com.captionchapterstudio.config.SecurityConfig.PasswordEncoder;
import com.captionchapterstudio.dto.AuthResponse;
import com.captionchapterstudio.dto.LoginRequest;
import com.captionchapterstudio.dto.RegisterRequest;
import com.captionchapterstudio.dto.UserProfileUpdateRequest;
import com.captionchapterstudio.model.User;
import com.captionchapterstudio.repository.UserRepository;
import com.captionchapterstudio.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("An account with this email address already exists");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(
                request.getName().trim(),
                request.getEmail().trim().toLowerCase(),
                hashedPassword
        );

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), false);

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getCreatedAt()
        );

        return new AuthResponse(token, userDto, "Registration successful! Welcome to Caption & Chapter Studio.");
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email address or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email address or password");
        }

        boolean rememberMe = Boolean.TRUE.equals(request.getRememberMe());
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), rememberMe);

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );

        return new AuthResponse(token, userDto, "Login successful! Welcome back, " + user.getName() + ".");
    }

    public AuthResponse.UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthResponse.UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public AuthResponse.UserDto updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!newEmail.equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email address is already in use by another account");
            }
            user.setEmail(newEmail);
        }

        user.setName(request.getName().trim());

        if (request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty()) {
            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Current password is required and must be correct to update password");
            }
            if (request.getNewPassword().trim().length() < 6) {
                throw new IllegalArgumentException("New password must be at least 6 characters long");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        }

        User updatedUser = userRepository.save(user);
        return new AuthResponse.UserDto(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getCreatedAt()
        );
    }
}
