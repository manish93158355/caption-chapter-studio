package com.captionchapterstudio.config;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SecurityConfig {

    public static class PasswordEncoder {
        public String encode(String rawPassword) {
            return BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
        }

        public boolean matches(String rawPassword, String encodedPassword) {
            if (rawPassword == null || encodedPassword == null) {
                return false;
            }
            try {
                return BCrypt.checkpw(rawPassword, encodedPassword);
            } catch (Exception e) {
                return false;
            }
        }
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new PasswordEncoder();
    }
}
