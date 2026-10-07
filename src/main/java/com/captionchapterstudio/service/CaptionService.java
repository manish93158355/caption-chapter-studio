package com.captionchapterstudio.service;

import com.captionchapterstudio.dto.CaptionGenerateRequest;
import com.captionchapterstudio.dto.CaptionGenerateResponse;
import com.captionchapterstudio.dto.CaptionGenerateResponse.CaptionOption;
import com.captionchapterstudio.dto.CaptionRequest;
import com.captionchapterstudio.model.Caption;
import com.captionchapterstudio.model.User;
import com.captionchapterstudio.repository.CaptionRepository;
import com.captionchapterstudio.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class CaptionService {

    private final CaptionRepository captionRepository;
    private final UserRepository userRepository;

    public CaptionService(CaptionRepository captionRepository, UserRepository userRepository) {
        this.captionRepository = captionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Topic-Aware Caption Generation Engine.
     * Generates 5 distinct, non-duplicate caption options directly related to the user's exact topic.
     */
    public CaptionGenerateResponse generateCaption(CaptionGenerateRequest req) {
        String topic = req.getTopic() != null ? req.getTopic().trim() : "Creative Concept";
        String platform = req.getPlatform() != null ? req.getPlatform().trim() : "Instagram";
        String tone = req.getTone() != null ? req.getTone().trim() : "Professional";
        String length = req.getLength() != null ? req.getLength().trim() : "Medium";
        boolean includeHashtags = req.getIncludeHashtags();
        int seed = req.getSeed();

        TopicProfile profile = analyzeTopic(topic);
        List<CaptionOption> options = new ArrayList<>();

        for (int i = 1; i <= 5; i++) {
            String captionText = buildDistinctCaption(profile, platform, tone, length, i, seed);
            List<String> tags = buildTopicHashtags(profile, platform, i, seed);

            if (includeHashtags) {
                captionText = captionText + "\n\n" + String.join(" ", tags);
            }

            options.add(new CaptionOption(captionText.trim(), tags));
        }

        return new CaptionGenerateResponse(options, platform, tone, length);
    }

    // ==========================================
    // TOPIC SEMANTIC ANALYZER
    // ==========================================

    private enum Domain {
        FITNESS, TECH, CAFE_FOOD, TRAVEL, FASHION, FESTIVAL_SALE, CAMPUS_FAREWELL, REAL_ESTATE, ART_MEDIA, GENERAL
    }

    private static class TopicProfile {
        String originalTopic;
        Domain domain;
        List<String> keywords;
        String primaryNoun;
        boolean hasOpeningOrLaunch;
        boolean hasSaleOrOffer;
        boolean hasLocation;
    }

    private TopicProfile analyzeTopic(String rawTopic) {
        TopicProfile profile = new TopicProfile();
        profile.originalTopic = rawTopic;
        String lower = rawTopic.toLowerCase();

        // Extract clean keywords
        String clean = lower.replaceAll("[^a-zA-Z0-9\\s]", " ");
        List<String> words = Arrays.stream(clean.split("\\s+"))
                .filter(w -> w.length() > 2 && !isStopWord(w))
                .collect(Collectors.toList());
        profile.keywords = words;
        profile.primaryNoun = words.isEmpty() ? rawTopic : words.get(0);

        profile.hasOpeningOrLaunch = lower.contains("open") || lower.contains("launch") || lower.contains("new") || lower.contains("starting");
        profile.hasSaleOrOffer = lower.contains("sale") || lower.contains("offer") || lower.contains("discount") || lower.contains("deal") || lower.contains("flat");
        profile.hasLocation = lower.contains("manali") || lower.contains("goa") || lower.contains("mumbai") || lower.contains("delhi") || lower.contains("paris") || lower.contains("himachal");

        // Domain classification
        if (containsAny(lower, "gym", "fitness", "workout", "crossfit", "training", "trainer", "bodybuilding", "muscle", "exercise", "cardio", "lifting", "weights", "squat", "sweat", "yoga", "reps", "iron")) {
            profile.domain = Domain.FITNESS;
        } else if (containsAny(lower, "iphone", "apple", "android", "samsung", "phone", "smartphone", "macbook", "laptop", "gadget", "software", "camera", "silicon", "ai", "processor", "tech", "device", "specs")) {
            profile.domain = Domain.TECH;
        } else if (containsAny(lower, "coffee", "cafe", "café", "latte", "cappuccino", "espresso", "barista", "brew", "beans", "bakery", "restaurant", "food", "dining", "brunch", "breakfast", "pizza", "burger", "dessert", "chai", "tea")) {
            profile.domain = Domain.CAFE_FOOD;
        } else if (containsAny(lower, "travel", "trip", "manali", "goa", "mountain", "mountains", "snow", "beach", "vacation", "roadtrip", "himalayas", "himachal", "trek", "hiking", "wanderlust", "scenic", "getaway", "valley")) {
            profile.domain = Domain.TRAVEL;
        } else if (containsAny(lower, "clothing", "t-shirt", "tshirt", "tee", "hoodie", "streetwear", "fashion", "brand", "apparel", "outfit", "drip", "fit", "fabric", "shoes", "sneakers", "wardrobe", "collection", "wear")) {
            profile.domain = Domain.FASHION;
        } else if (containsAny(lower, "diwali", "christmas", "new year", "holi", "eid", "sale", "discount", "offer", "shopping", "black friday", "festive", "deals", "celebration", "lights", "fest")) {
            profile.domain = Domain.FESTIVAL_SALE;
        } else if (containsAny(lower, "farewell", "college", "campus", "graduation", "batch", "seniors", "juniors", "friends", "convocation", "memories", "degrees", "hostel", "canteen")) {
            profile.domain = Domain.CAMPUS_FAREWELL;
        } else if (containsAny(lower, "home", "house", "interior", "decor", "property", "villa", "apartment", "living room", "architecture")) {
            profile.domain = Domain.REAL_ESTATE;
        } else if (containsAny(lower, "music", "song", "track", "album", "photography", "photo", "cinema", "movie", "film", "art", "painting", "studio")) {
            profile.domain = Domain.ART_MEDIA;
        } else {
            profile.domain = Domain.GENERAL;
        }

        return profile;
    }

    private boolean containsAny(String input, String... targets) {
        for (String t : targets) {
            if (input.contains(t)) return true;
        }
        return false;
    }

    private boolean isStopWord(String word) {
        Set<String> stops = Set.of("the", "and", "for", "with", "from", "that", "this", "what", "how", "why", "when", "your", "our", "are");
        return stops.contains(word.toLowerCase());
    }

    // ==========================================
    // CAPTION COMPOSER FOR 5 DISTINCT OPTIONS
    // ==========================================

    private String buildDistinctCaption(TopicProfile p, String platform, String tone, String length, int optionIndex, int seed) {
        String topic = p.originalTopic;
        StringBuilder sb = new StringBuilder();

        // 1. Hook based on Option Angle
        String hook = getTopicHook(p, tone, platform, optionIndex, seed);
        sb.append(hook);

        // 2. Middle Body based on Length and Topic Domain
        if (!"Short".equalsIgnoreCase(length)) {
            sb.append("\n\n");
            String body = getTopicBody(p, tone, platform, optionIndex, seed);
            sb.append(body);
        }

        // 3. Extended Insights for Long
        if ("Long".equalsIgnoreCase(length)) {
            sb.append("\n\n");
            String extended = getTopicExtended(p, tone, platform, optionIndex);
            sb.append(extended);
        }

        // 4. Call to Action adapted to Platform & Tone
        sb.append("\n\n");
        String cta = getTopicCta(p, platform, tone, optionIndex);
        sb.append(cta);

        String result = sb.toString();

        // Platform-specific formatting tweaks
        if ("Twitter/X".equalsIgnoreCase(platform)) {
            // Ensure brevity for Twitter/X
            if (result.length() > 270) {
                result = hook + " " + cta;
                if (result.length() > 270) {
                    result = result.substring(0, 260) + "...";
                }
            }
        }

        return result;
    }

    private String getTopicHook(TopicProfile p, String tone, String platform, int optionIndex, int seed) {
        String topic = p.originalTopic;

        // Apply Gen-Z tone specifics
        if ("Gen-Z".equalsIgnoreCase(tone)) {
            switch (optionIndex) {
                case 1: return "not gonna lie, " + topic + " just cleared every expectation no cap 😭✨";
                case 2: return "the way " + topic + " is giving absolute main character energy right now?? obsessing.";
                case 3: return "tell me why nobody warned me that " + topic + " would be this iconic fr?!";
                case 4: return "POV: you finally experience " + topic + " and life instantly upgrades 📈";
                default: return "if you haven't checked out " + topic + " yet, what are we even doing bestie? pure vibes only.";
            }
        }

        // Apply Cinematic tone specifics
        if ("Cinematic".equalsIgnoreCase(tone)) {
            switch (optionIndex) {
                case 1: return "The curtains draw back. Under the gleaming spotlight, " + topic + " makes its unforgettable entrance.";
                case 2: return "Every shadow, every detail, every contour crafted for this exact frame: " + topic + ".";
                case 3: return "Moments suspended in time. When vision and atmosphere collide, " + topic + " is born.";
                case 4: return "A quiet pulse before the crescendo—welcome to the era of " + topic + ".";
                default: return "Beyond the ordinary horizon lies " + topic + ". Witness the journey unfold.";
            }
        }

        // Apply Storytelling tone specifics
        if ("Storytelling".equalsIgnoreCase(tone)) {
            switch (optionIndex) {
                case 1: return "It all started with an ambitious spark, and today " + topic + " has finally become a reality.";
                case 2: return "Looking back at the weeks of relentless preparation, " + topic + " represents so much more than just a date on the calendar.";
                case 3: return "There's a story behind every single choice that brought " + topic + " to life—and we're ready to share it.";
                case 4: return "From early sketches and late-night revisions to this exact moment: here is the real journey of " + topic + ".";
                default: return "Some milestones mark the end of a chapter; " + topic + " is where the real adventure begins.";
            }
        }

        // Domain-specific Hooks for Fitness
        if (p.domain == Domain.FITNESS) {
            switch (optionIndex) {
                case 1: return "🚨 The iron is waiting! " + topic + " is officially here to redefine your fitness journey.";
                case 2: return "No more excuses, no more waiting. Step into " + topic + " and feel the energy from the very first rep.";
                case 3: return "Brand new equipment, certified trainers, and zero limits. Are you ready for " + topic + "?";
                case 4: return "Behind every transformation is an environment built for grit. Welcome to " + topic + ".";
                default: return "Your fitness breakthrough begins today. " + topic + " has opened its doors—let's get to work! 💪";
            }
        }

        // Domain-specific Hooks for Tech
        if (p.domain == Domain.TECH) {
            switch (optionIndex) {
                case 1: return "⚡ The future of handheld engineering has arrived: say hello to " + topic + ".";
                case 2: return "Unmatched processing power, surgical camera precision, and a design that turns heads. " + topic + " is here.";
                case 3: return "Is " + topic + " the biggest tech leap of the year? We spent hands-on time testing every spec.";
                case 4: return "Precision craftsmanship meets cutting-edge silicon. Here is our deep-dive review into " + topic + ".";
                default: return "Next-generation performance is no longer an upgrade—it's a whole new standard with " + topic + ".";
            }
        }

        // Domain-specific Hooks for Coffee & Food
        if (p.domain == Domain.CAFE_FOOD) {
            switch (optionIndex) {
                case 1: return "☕ Freshly roasted beans, warm golden microfoam, and the cozy aroma of " + topic + ".";
                case 2: return "Your morning routine just found its holy grail. Welcome to your new favorite table at " + topic + ".";
                case 3: return "Espresso or artisanal latte? Whatever your brew, " + topic + " is crafting your daily dose of bliss.";
                case 4: return "Behind every velvety sip is a barista who obsesses over the perfect pull. Discover " + topic + ".";
                default: return "Good coffee isn't a luxury—it's how the best days begin. Grab your cup at " + topic + " ✨";
            }
        }

        // Domain-specific Hooks for Travel
        if (p.domain == Domain.TRAVEL) {
            switch (optionIndex) {
                case 1: return "🏔️ Snow-capped mountain peaks, pine-scented breeze, and total serenity: " + topic + ".";
                case 2: return "Trading city traffic for alpine vistas and scenic winding roads on our journey to " + topic + ".";
                case 3: return "Have you ever stood in awe of the mountains? That's the raw magic of " + topic + ".";
                case 4: return "Chasing sunsets, crisp mountain air, and unforgettable memories across " + topic + ".";
                default: return "The mountains are calling, and " + topic + " is the ultimate answer to wanderlust 🎒❄️";
            }
        }

        // Domain-specific Hooks for Fashion
        if (p.domain == Domain.FASHION) {
            switch (optionIndex) {
                case 1: return "🧵 Clean silhouettes, premium heavyweight cotton, and elevated streetwear: " + topic + " has dropped.";
                case 2: return "Style that speaks before you say a word. Discover the bespoke fit and detail of " + topic + ".";
                case 3: return "Oversized comfort or tailored precision? " + topic + " delivers the ultimate wardrobe upgrade.";
                case 4: return "Engineered for everyday wear, built to turn heads. Here is the inspiration behind " + topic + ".";
                default: return "The wait is over. Elevate your everyday drip with the all-new " + topic + " collection 🔥👕";
            }
        }

        // Domain-specific Hooks for Festival / Sale
        if (p.domain == Domain.FESTIVAL_SALE) {
            switch (optionIndex) {
                case 1: return "✨ Shimmering lights, festive vibes, and massive celebrations: " + topic + " is live now!";
                case 2: return "The biggest savings of the season have landed! Celebrate this festive joy with " + topic + ".";
                case 3: return "Looking for the ultimate gifts for your loved ones? " + topic + " brings you exclusive festive treats.";
                case 4: return "Celebrate auspicious beginnings with unbelievable price drops during " + topic + ".";
                default: return "Hurry before stock runs out! Make your celebrations extra special with " + topic + " 🎁🎉";
            }
        }

        // Domain-specific Hooks for College Farewell
        if (p.domain == Domain.CAMPUS_FAREWELL) {
            switch (optionIndex) {
                case 1: return "🎓 Walking into campus as strangers, walking out with a lifetime of memories: " + topic + " 🤍";
                case 2: return "From endless canteen laughs to late-night submissions—here's celebrating the incredible journey of " + topic + ".";
                case 3: return "How did four years fly by in the blink of an eye? Bittersweet emotions running high for " + topic + ".";
                case 4: return "To the seniors who inspired us and the friends who became family: happy " + topic + "!";
                default: return "Here’s to closing this golden chapter and conquering whatever comes next. Cheers to " + topic + " 🥂";
            }
        }

        // General / Custom Topic Hooks
        switch (optionIndex) {
            case 1:
                return "Introducing " + topic + "—crafted with purpose and designed to make an immediate impact.";
            case 2:
                return "Experience " + topic + " in a whole new light. Here is everything you need to know.";
            case 3:
                return "What makes " + topic + " stand out from the rest? Let's break down the details.";
            case 4:
                return "A closer look at " + topic + ": how dedication and precision shaped the final result.";
            default:
                return "The wait is officially over. Dive into " + topic + " and see why everyone is talking about it.";
        }
    }

    private String getTopicBody(TopicProfile p, String tone, String platform, int optionIndex, int seed) {
        String topic = p.originalTopic;

        if ("Gen-Z".equalsIgnoreCase(tone)) {
            switch (optionIndex) {
                case 1: return "literally cannot stop thinking about the details here. the vibe check is fully passed and everyone needs this on their radar immediately.";
                case 2: return "we really leveled up with " + topic + ". if you see me never shutting up about this, mind your business because it really hits that different.";
                case 3: return "drop what you're doing and take notes. this isn't just another drop—it's the standard for everything coming next.";
                case 4: return "the aesthetics? 10/10. the execution? unmatched. " + topic + " is officially that girl and we are here for it.";
                default: return "from the jump, you can tell the energy behind " + topic + " is on another level. big moves only.";
            }
        }

        if ("Funny".equalsIgnoreCase(tone)) {
            switch (optionIndex) {
                case 1: return "My bank account asked me to reconsider, but my soul already committed to " + topic + ". Self-control had a good run.";
                case 2: return "Plan: Be reasonable and calm.\nReality: 4 minutes in, and " + topic + " has taken over my entire personality.";
                case 3: return "If loving " + topic + " is wrong, I don't want to be right. Send help or just bring coffee.";
                case 4: return "Warning: Exposure to " + topic + " may cause spontaneous smiling, high enthusiasm, and excessive bragging to friends.";
                default: return "Whoever said happiness can't be bought clearly hasn't experienced " + topic + " yet.";
            }
        }

        if ("Emotional".equalsIgnoreCase(tone)) {
            switch (optionIndex) {
                case 1: return "Sometimes a moment comes along that reminds you why you started in the first place. " + topic + " holds so much heart and quiet dedication.";
                case 2: return "Behind every smile, there were late nights, doubts, and people who stood by our side. " + topic + " is dedicated to everyone who believed.";
                case 3: return "It’s not just about the milestone—it's about the deep connections and memories that make " + topic + " so deeply meaningful.";
                case 4: return "Taking a deep breath and soaking this in. Grateful for the lessons, the laughter, and the community that made " + topic + " possible.";
                default: return "Hold on to the moments that matter. " + topic + " is proof that genuine passion always finds its way home.";
            }
        }

        if (p.domain == Domain.FITNESS) {
            switch (optionIndex) {
                case 1: return "Equipped with heavy-duty lifting racks, premium cardio machines, pristine locker rooms, and certified personal trainers ready to push you past your plateau.";
                case 2: return "Whether you're hitting personal bests on the squat rack or starting your first week of conditioning, our community is built to support your grind every step of the way.";
                case 3: return "Exclusive founder membership passes, personalized nutrition assessments, and group HIIT classes tailored for every fitness level.";
                case 4: return "We designed this space for people who value sweat, discipline, and real progress. High energy, zero intimidation, and top-tier coaching.";
                default: return "From morning power sessions to late-night lifts, " + topic + " delivers the environment you need to build the strongest version of yourself.";
            }
        }

        if (p.domain == Domain.TECH) {
            switch (optionIndex) {
                case 1: return "Boasting a redesigned titanium enclosure, custom thermal architecture, and an advanced camera system engineered for cinematic low-light capture.";
                case 2: return "With all-day battery endurance, seamless ecosystem synchronicity, and blazing benchmark scores, this device redefines what mobile productivity feels like.";
                case 3: return "From computational AI photography to razor-sharp display refresh rates, every millimeter of " + topic + " feels purpose-built for creators.";
                case 4: return "We benchmarked the battery, screen brightness, and processor under peak load. The real-world performance results speak for themselves.";
                default: return "Sleeker bezels, fluid tactile feedback, and next-generation charging speeds make " + topic + " an undeniable flagship experience.";
            }
        }

        if (p.domain == Domain.CAFE_FOOD) {
            switch (optionIndex) {
                case 1: return "Single-origin beans roasted to perfection, paired with oven-fresh pastries and a cozy corner bathed in warm sunlight.";
                case 2: return "Whether you're typing away on your laptop or catching up on deep conversations with friends, our ambient acoustics and artisanal brews create the ideal sanctuary.";
                case 3: return "Sip through rich dark chocolate notes, velvety microfoam, and custom seasonal blends curated by our passionate baristas.";
                case 4: return "Made from ethically sourced beans and roasted in small batches to preserve every drop of authentic flavor.";
                default: return "Pull up a chair, inhale the fresh ground aroma, and savor food and drinks crafted with pure dedication.";
            }
        }

        if (p.domain == Domain.TRAVEL) {
            switch (optionIndex) {
                case 1: return "Waking up to chilly morning mist, walking through pine forests, and watching the sun paint the snow-covered peaks in shades of gold.";
                case 2: return "From thrilling mountain passes and cozy riverside cafes to starlit bonfires under freezing Himalayan skies, every second here is unforgettable.";
                case 3: return "The crisp alpine air, the warmth of hot chai at a roadside dhaba, and the breathtaking peace only the mountains can give you.";
                case 4: return "Stepping outside your comfort zone and discovering the quiet beauty of hidden trails, local villages, and panoramic valleys.";
                default: return "Nothing clears your mind quite like mountain roads, snowy horizons, and the thrill of exploring unexplored trails.";
            }
        }

        if (p.domain == Domain.FASHION) {
            switch (optionIndex) {
                case 1: return "Crafted with 240+ GSM pre-shrunk cotton, drop-shoulder silhouettes, and minimalist typography that effortlessly anchors any street fit.";
                case 2: return "Breathable all-day comfort meets refined tailoring. Designed to look just as sharp with relaxed denim as it does layered under a coat.";
                case 3: return "Limited edition batch with precision stitching and fade-resistant colorways built to outlast seasonal trends.";
                case 4: return "We obsessed over the collar tightness, hem length, and drape so you never have to second-guess what to throw on.";
                default: return "Available in versatile neutral tones and bold statement pieces. Elevate your wardrobe rotation starting today.";
            }
        }

        if (p.domain == Domain.FESTIVAL_SALE) {
            switch (optionIndex) {
                case 1: return "Enjoy up to 50% off sitewide, exclusive bundle deals, and complimentary festive gift wrapping on all your favorite picks.";
                case 2: return "From traditional handcrafted essentials to premium lifestyle upgrades, light up your home and celebrate with unmatched savings.";
                case 3: return "Limited-time festive discounts live right now across our entire catalog—grab your wishlist before the best items sell out!";
                case 4: return "Double your festive joy with special instant discounts, cashback offers, and hassle-free door delivery.";
                default: return "Celebrate auspicious moments with quality products curated to bring happiness, prosperity, and joy to your family.";
            }
        }

        if (p.domain == Domain.CAMPUS_FAREWELL) {
            switch (optionIndex) {
                case 1: return "From nervously walking into the orientation hall on day one to taking our final batch photos together, these walls hold our best years.";
                case 2: return "Thank you for the endless memories, the proxy attendances, the late-night exam cram sessions, and a friendship that will outlive any distance.";
                case 3: return "We laughed, we stressed over deadlines, we conquered festivals, and now we step out into the real world with full hearts.";
                case 4: return "A toast to the teachers who guided us, the campus that sheltered us, and the batchmates who made every single day worth remembering.";
                default: return "Goodbyes are never easy, but the memories created right here will stay with us forever as we chase our dreams.";
            }
        }

        // General / Custom Topic
        switch (optionIndex) {
            case 1:
                return "Built with attention to detail and focused on delivering real value. Every element has been tuned to provide an unmatched experience with " + topic + ".";
            case 2:
                return "When strategy meets relentless execution, the outcome speaks for itself. " + topic + " is setting a new benchmark for what's possible.";
            case 3:
                return "Explore how this was conceptualized, the creative decisions made along the way, and why it matters right now.";
            case 4:
                return "Clean, modern, and uncompromising in quality. Here is your complete guide to getting the most out of " + topic + ".";
            default:
                return "Whether you're just discovering this for the first time or following along from the start, " + topic + " represents a major leap forward.";
        }
    }

    private String getTopicExtended(TopicProfile p, String tone, String platform, int optionIndex) {
        String topic = p.originalTopic;

        if (p.domain == Domain.FITNESS) {
            return "📌 Key Highlights of " + topic + ":\n" +
                   "• State-of-the-art bio-mechanical resistance machines\n" +
                   "• Dedicated Olympic powerlifting & turf conditioning zone\n" +
                   "• Certified nutrition & personal training assessments\n" +
                   "• Early-bird membership offers available this week only";
        }
        if (p.domain == Domain.TECH) {
            return "🔍 Technical Breakdown:\n" +
                   "• Next-generation silicon with 30% enhanced power efficiency\n" +
                   "• Pro-grade optical sensors with zero shutter lag\n" +
                   "• Edge-to-edge adaptive 120Hz dynamic display\n" +
                   "• Reinforced aerospace-grade chassis";
        }
        if (p.domain == Domain.CAFE_FOOD) {
            return "✨ What makes " + topic + " special:\n" +
                   "• 100% ethically sourced Arabica beans\n" +
                   "• Daily small-batch artisan roasting\n" +
                   "• Freshly baked gourmet brioche & sourdough\n" +
                   "• Cozy high-speed Wi-Fi workspace corners";
        }
        if (p.domain == Domain.TRAVEL) {
            return "🗺️ Trip Notes & Highlights:\n" +
                   "• Best time to visit for fresh snow & clear skies\n" +
                   "• Must-try local cafes and hidden scenic viewpoints\n" +
                   "• Essential packing tips for high-altitude weather\n" +
                   "• Sustainable travel: leave no trace, cherish the mountains";
        }
        if (p.domain == Domain.FASHION) {
            return "💎 Collection Spec Sheet:\n" +
                   "• 100% combed ring-spun heavyweight cotton\n" +
                   "• Ribbed crewneck collar with twin-needle stitching\n" +
                   "• Anti-pilling & pre-shrunk wash treatment\n" +
                   "• Unisex relaxed oversized streetwear fit";
        }

        return "Key Takeaways:\n" +
               "• Designed with longevity and human-first value\n" +
               "• Tested rigorously to exceed performance standards\n" +
               "• Transparent, authentic, and built for our community";
    }

    private String getTopicCta(TopicProfile p, String platform, String tone, int optionIndex) {
        String topic = p.originalTopic;

        if ("Instagram".equalsIgnoreCase(platform)) {
            switch (optionIndex) {
                case 1: return "Tap the link in bio to explore more! Drop your thoughts below 👇✨";
                case 2: return "Save this post for later and tag a friend who needs to see this! 💬";
                case 3: return "Double-tap if you agree and drop a 🔥 in the comments!";
                case 4: return "Swipe through to see the full details. Which one is your favorite? Tell us below!";
                default: return "Turn on post notifications so you never miss an update on " + topic + " 🔔";
            }
        }

        if ("LinkedIn".equalsIgnoreCase(platform)) {
            switch (optionIndex) {
                case 1: return "How does your team approach this in your industry? I'd welcome your thoughts in the comments.";
                case 2: return "If you found this perspective valuable, feel free to share it with your network.";
                case 3: return "What has been your biggest takeaway navigating " + topic + "? Let's connect below.";
                case 4: return "Looking forward to hearing from fellow leaders on how this impacts upcoming strategies.";
                default: return "Agree or disagree? Share your point of view below.";
            }
        }

        if ("Twitter/X".equalsIgnoreCase(platform)) {
            switch (optionIndex) {
                case 1: return "RT to spread the word. What's your take?";
                case 2: return "Bookmark this for your feed. Thoughts?";
                case 3: return "Drop your answer below 🧵👇";
                case 4: return "Quote tweet with your reaction!";
                default: return "Follow for daily breakdowns and drops 🚀";
            }
        }

        if ("YouTube".equalsIgnoreCase(platform)) {
            switch (optionIndex) {
                case 1: return "Make sure to hit Like, Subscribe, and ring the notification bell for weekly releases! 🔔🎬";
                case 2: return "Check the description box below for full links, timestamps, and free resources! 👇";
                case 3: return "Leave a comment answering our question of the day—we reply to everyone in the first hour!";
                case 4: return "Share this video with someone who needs to see this today!";
                default: return "Subscribe to the studio channel and join our creator community 🚀";
            }
        }

        // Facebook / Default
        switch (optionIndex) {
            case 1: return "What do you think about this? Let's discuss in the comments below!";
            case 2: return "Tag someone who would love this and share to your feed!";
            case 3: return "Click the link to learn more and join the conversation today.";
            case 4: return "We want to hear your stories—share them with our community below!";
            default: return "Hit like and share if this made your day better!";
        }
    }

    private List<String> buildTopicHashtags(TopicProfile p, String platform, int optionIndex, int seed) {
        Set<String> tags = new LinkedHashSet<>();

        // Generate clean CamelCase tag from original topic
        String cleanTopic = p.originalTopic.replaceAll("[^a-zA-Z0-9\\s]", " ");
        String[] words = cleanTopic.split("\\s+");
        StringBuilder topicTag = new StringBuilder("#");
        for (String w : words) {
            if (!w.trim().isEmpty()) {
                topicTag.append(w.substring(0, 1).toUpperCase()).append(w.substring(1).toLowerCase());
            }
        }
        if (topicTag.length() > 1) {
            tags.add(topicTag.toString());
        }

        // Domain-specific Hashtags (Strictly relevant to user topic!)
        if (p.domain == Domain.FITNESS) {
            tags.addAll(List.of("#NewGym", "#GymLife", "#FitnessJourney", "#WorkoutMotivation", "#GymOpening", "#FitFam", "#TrainHard", "#FitnessCommunity"));
        } else if (p.domain == Domain.TECH) {
            tags.addAll(List.of("#TechNews", "#SmartphoneTech", "#FlagshipSpecs", "#NextGenTech", "#GadgetLover", "#Innovation", "#TechUnboxing"));
        } else if (p.domain == Domain.CAFE_FOOD) {
            tags.addAll(List.of("#CoffeeLovers", "#CafeAesthetic", "#ArtisanalRoast", "#LatteArt", "#CoffeeShopVibes", "#FreshlyBrewed", "#CafeCulture"));
        } else if (p.domain == Domain.TRAVEL) {
            tags.addAll(List.of("#TravelDiaries", "#MountainVibes", "#SnowTrails", "#Wanderlust", "#ExploreNature", "#IncredibleJourneys", "#TravelGram"));
        } else if (p.domain == Domain.FASHION) {
            tags.addAll(List.of("#StreetwearStyle", "#FashionDrop", "#TeeCollection", "#OOTD", "#OutfitInspo", "#ElevatedBasics", "#ClothingBrand"));
        } else if (p.domain == Domain.FESTIVAL_SALE) {
            tags.addAll(List.of("#FestiveSale", "#MegaDiscounts", "#FestivalOfLights", "#ShoppingSpree", "#ExclusiveDeals", "#FestiveOffers"));
        } else if (p.domain == Domain.CAMPUS_FAREWELL) {
            tags.addAll(List.of("#CollegeFarewell", "#CampusDiaries", "#BatchMemories", "#GraduationVibes", "#FarewellParty", "#LifelongFriends"));
        } else if (p.domain == Domain.REAL_ESTATE) {
            tags.addAll(List.of("#DreamHome", "#InteriorDesign", "#HomeDecor", "#ModernLiving", "#ArchitectureInspo"));
        } else if (p.domain == Domain.ART_MEDIA) {
            tags.addAll(List.of("#CreativeStudio", "#ArtisticVision", "#CinematicMood", "#VisualStory", "#BehindTheLens"));
        } else {
            for (String kw : p.keywords) {
                if (kw.length() >= 3) {
                    tags.add("#" + kw.substring(0, 1).toUpperCase() + kw.substring(1).toLowerCase());
                }
            }
            tags.add("#TrendingNow");
            tags.add("#Creativity");
        }

        // Platform-specific tag
        if ("LinkedIn".equalsIgnoreCase(platform)) {
            tags.add("#ProfessionalGrowth");
        } else if ("Instagram".equalsIgnoreCase(platform)) {
            tags.add("#InstaDaily");
        }

        // Shuffle slightly based on optionIndex and seed to give varied hashtag clusters
        List<String> list = new ArrayList<>(tags);
        int startIndex = (optionIndex + seed) % Math.max(1, list.size() - 4);
        int takeCount = Math.min(6, list.size());

        List<String> result = new ArrayList<>();
        result.add(topicTag.toString());
        for (int i = 0; i < list.size() && result.size() < takeCount; i++) {
            String candidate = list.get((startIndex + i) % list.size());
            if (!result.contains(candidate)) {
                result.add(candidate);
            }
        }

        return result;
    }

    // ==========================================
    // CAPTION CRUD OPERATIONS
    // ==========================================

    @Transactional
    public Caption createCaption(Long userId, CaptionRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Caption caption = new Caption(
                user,
                req.getTopic().trim(),
                req.getPlatform().trim(),
                req.getTone().trim(),
                req.getContent().trim(),
                req.getFavorite()
        );

        return captionRepository.save(caption);
    }

    public List<Caption> getUserCaptions(Long userId, String platform, String search, Boolean favorite) {
        String cleanPlatform = (platform != null && !platform.trim().isEmpty() && !"all".equalsIgnoreCase(platform))
                ? platform.trim() : null;
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        return captionRepository.searchCaptions(userId, cleanPlatform, cleanSearch, favorite);
    }

    public Caption getCaptionById(Long userId, Long id) {
        return captionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Caption not found with id: " + id));
    }

    @Transactional
    public Caption updateCaption(Long userId, Long id, CaptionRequest req) {
        Caption caption = getCaptionById(userId, id);
        caption.setTopic(req.getTopic().trim());
        caption.setPlatform(req.getPlatform().trim());
        caption.setTone(req.getTone().trim());
        caption.setContent(req.getContent().trim());
        if (req.getFavorite() != null) {
            caption.setFavorite(req.getFavorite());
        }
        return captionRepository.save(caption);
    }

    @Transactional
    public void deleteCaption(Long userId, Long id) {
        Caption caption = getCaptionById(userId, id);
        captionRepository.delete(caption);
    }

    @Transactional
    public Caption toggleFavorite(Long userId, Long id) {
        Caption caption = getCaptionById(userId, id);
        caption.setFavorite(!Boolean.TRUE.equals(caption.getFavorite()));
        return captionRepository.save(caption);
    }
}
