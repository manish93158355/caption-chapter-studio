package com.captionchapterstudio.config;

import com.captionchapterstudio.config.SecurityConfig.PasswordEncoder;
import com.captionchapterstudio.model.Caption;
import com.captionchapterstudio.model.Chapter;
import com.captionchapterstudio.model.User;
import com.captionchapterstudio.repository.CaptionRepository;
import com.captionchapterstudio.repository.ChapterRepository;
import com.captionchapterstudio.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CaptionRepository captionRepository;
    private final ChapterRepository chapterRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, CaptionRepository captionRepository, ChapterRepository chapterRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.captionRepository = captionRepository;
        this.chapterRepository = chapterRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed Demo User
            User demoUser = new User();
            demoUser.setName("Alex Mercer");
            demoUser.setEmail("demo@captionstudio.com");
            demoUser.setPassword(passwordEncoder.encode("Demo@1234"));
            demoUser = userRepository.save(demoUser);

            // Seed Realistic Captions
            Caption c1 = new Caption(
                    demoUser,
                    "Next-Gen SaaS Launch",
                    "Instagram",
                    "Professional",
                    "Something extraordinary has arrived. Designed with meticulous attention to detail and built for creators who value craftsmanship.\n\nTake your digital workflow into the next dimension. Tap the link in bio to experience Caption & Chapter Studio early. 🚀✨\n\n#SaaSProduct #ContentCreation #ProductLaunch #Productivity #CreativeTools #Innovation",
                    true
            );

            Caption c2 = new Caption(
                    demoUser,
                    "3 Principles for High-Converting Copy",
                    "LinkedIn",
                    "Motivational",
                    "Great copy isn't written—it is carved out of human psychology.\n\nHere are 3 mental shifts that doubled our audience retention:\n1. Hook with empathy, not hype.\n2. Sell the transformation, not the feature.\n3. Make your Call to Action effortless.\n\nWhich of these 3 are you prioritizing this quarter? Let's discuss in the comments.\n\n#Copywriting #AudienceGrowth #MarketingStrategy #Leadership #CareerGrowth",
                    true
            );

            Caption c3 = new Caption(
                    demoUser,
                    "When the Code Finally Compiles at 2 AM",
                    "Twitter/X",
                    "Funny",
                    "0 errors. 0 warnings. 47 open tabs. 3 empty coffee cups. Don't breathe on the keyboard or it might change its mind. 😂\n\n#DeveloperHumor #CodingLife #SoftwareEngineering #TechLife",
                    false
            );

            Caption c4 = new Caption(
                    demoUser,
                    "Mastering High-Output Content Strategy",
                    "YouTube",
                    "Professional",
                    "Welcome back to the studio! In this comprehensive masterclass, we break down the exact content architecture used to produce 100+ high-engagement assets per month without burnout.\n\n📌 Timestamps:\n00:00 - Introduction\n03:15 - Ideation Frameworks\n09:40 - Batching Captions & Long-form Chapters\n16:20 - Workflow Automation\n\nDon't forget to Like, Subscribe, and check the description for free templates! 🔔🎬\n\n#YouTubeCreators #ContentStrategy #VideoProduction #WorkflowHacks",
                    false
            );

            captionRepository.save(c1);
            captionRepository.save(c2);
            captionRepository.save(c3);
            captionRepository.save(c4);

            // Seed Realistic Chapters
            Chapter ch1 = new Chapter(
                    demoUser,
                    "Chapter 1: The Anatomy of Modern Digital Storytelling",
                    "Content Strategy",
                    "Understanding how narrative structure drives user engagement across digital interfaces.",
                    "<h2>The First Sentence Is Everything</h2><p>In an era characterized by micro-attention spans and infinite feeds, the traditional slow burn of long-form prose is rarely afforded grace. The reader must feel the heartbeat of your thesis within the first three seconds.</p><p>We define narrative velocity as the speed with which a thought travels from reader cognition into visceral emotion. To maximize this velocity, modern creators discard superfluous throat-clearing and launch immediately into tension.</p><h3>The Triad of Resonance</h3><ul><li><strong>The Paradox:</strong> Challenge a deeply held conventional assumption.</li><li><strong>The Mirror:</strong> Reflect the unspoken struggle of your reader.</li><li><strong>The Resolution:</strong> Offer an actionable, disciplined path forward.</li></ul><p>When these three vectors converge, language transcends mere text—it becomes an intellectual landmark.</p>",
                    true
            );

            Chapter ch2 = new Chapter(
                    demoUser,
                    "Chapter 2: Engineering Resilient Cloud Software",
                    "Technology",
                    "A deep dive into decoupled system boundaries, microservices, and state reconciliation.",
                    "<h2>Decoupling for Scale</h2><p>Software architecture is fundamentally the management of complexity over time. When services are tightly bound to concrete implementations, even minor updates introduce systemic fragility.</p><blockquote>\"Simplicity is prerequisite for reliability.\" — Edsger W. Dijkstra</blockquote><p>By enforcing strict boundary contracts through well-defined REST endpoints and event-driven architectures, distributed teams can build scalable applications that withstand unpredictable traffic spikes without performance degradation.</p>",
                    false
            );

            chapterRepository.save(ch1);
            chapterRepository.save(ch2);
        }
    }
}
