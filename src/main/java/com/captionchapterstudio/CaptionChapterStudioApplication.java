package com.captionchapterstudio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CaptionChapterStudioApplication {

    public static void main(String[] args) {
        SpringApplication.run(CaptionChapterStudioApplication.class, args);
        System.out.println("==================================================================");
        System.out.println("🚀 Caption & Chapter Studio Backend is running on port 8080!");
        System.out.println("🌐 Web Application: http://localhost:8080");
        System.out.println("📑 API Base URL:    http://localhost:8080/api");
        System.out.println("💾 H2 Console:     http://localhost:8080/h2-console");
        System.out.println("👤 Demo Account:    demo@captionstudio.com  /  Demo@1234");
        System.out.println("==================================================================");
    }
}
