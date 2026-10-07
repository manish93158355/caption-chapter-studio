-- ==============================================================================
-- Caption & Chapter Studio - Database Schema
-- Database Name: caption_chapter_studio
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS caption_chapter_studio 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE caption_chapter_studio;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Captions Table
CREATE TABLE IF NOT EXISTS captions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_captions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Chapters Table
CREATE TABLE IF NOT EXISTS chapters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    content LONGTEXT NOT NULL,
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_chapters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional Initial Seed Data (Password is 'Demo@1234' hashed with BCrypt)
INSERT IGNORE INTO users (id, name, email, password, created_at) VALUES 
(1, 'Alex Mercer', 'demo@captionstudio.com', '$2a$10$w0u3e6V7yV2sIu7qH95w3.eM8d3eR8T9S3q8h9Q5j3i8E9Y0h1j7K', NOW());

INSERT IGNORE INTO captions (id, user_id, topic, platform, tone, content, favorite, created_at) VALUES 
(1, 1, 'New SaaS Product Launch', 'Instagram', 'Professional', 'Something extraordinary is coming. Designed with meticulous attention to detail, built for creators who expect nothing less than perfection.\n\nReady to transform your content workflow? Tap the link in bio to join early access. 🚀✨\n\n#ContentCreator #ProductLaunch #SaaS #Productivity #CreativeTools #TechInnovation', 1, NOW()),
(2, 1, '5 Productivity Hacks for Creators', 'LinkedIn', 'Motivational', 'Success in content creation isn''t about doing more—it''s about doing what matters with laser focus.\n\nHere are 3 frameworks top writers use:\n1. The 80/20 creation rule\n2. Batching caption concepts weekly\n3. Iterating in public\n\nWhich strategy resonates most with your current workflow?', 0, NOW());

INSERT IGNORE INTO chapters (id, user_id, title, category, description, content, favorite, created_at, updated_at) VALUES 
(1, 1, 'The Architecture of Modern SaaS', 'Technology', 'A deep dive into building modular, resilient web software.', '<h3>The New Paradigm</h3><p>In modern web engineering, clarity precedes execution. When systems are designed with clear domain boundaries, scaling from zero to a million users becomes an organic evolution rather than a complete rewrite.</p><p>We examine the three foundational pillars: <strong>declarative data streams</strong>, <em>atomic interface primitives</em>, and zero-trust security postures.</p>', 1, NOW(), NOW());
