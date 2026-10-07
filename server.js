/**
 * Caption & Chapter Studio - Localhost Server (Node.js Zero-Dependency Server)
 * Serves the full-stack web application & REST APIs on http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// In-Memory Data Store (Initialized with Demo Seed Data)
let users = [
    {
        id: 1,
        name: "Alex Mercer",
        email: "demo@captionstudio.com",
        password: "Demo@1234",
        createdAt: new Date().toISOString()
    }
];

let captions = [
    {
        id: 1,
        userId: 1,
        topic: "Next-Gen SaaS Launch",
        platform: "Instagram",
        tone: "Professional",
        content: "Something extraordinary has arrived. Designed with meticulous attention to detail and built for creators who value craftsmanship.\n\nTake your digital workflow into the next dimension. Tap the link in bio to experience Caption & Chapter Studio early. 🚀✨\n\n#SaaSProduct #ContentCreation #ProductLaunch #Productivity #CreativeTools #Innovation",
        favorite: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        userId: 1,
        topic: "3 Principles for High-Converting Copy",
        platform: "LinkedIn",
        tone: "Motivational",
        content: "Great copy isn't written—it is carved out of human psychology.\n\nHere are 3 mental shifts that doubled our audience retention:\n1. Hook with empathy, not hype.\n2. Sell the transformation, not the feature.\n3. Make your Call to Action effortless.\n\nWhich of these 3 are you prioritizing this quarter? Let's discuss in the comments.\n\n#Copywriting #AudienceGrowth #MarketingStrategy #Leadership #CareerGrowth",
        favorite: true,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
        id: 3,
        userId: 1,
        topic: "When the Code Finally Compiles at 2 AM",
        platform: "Twitter/X",
        tone: "Funny",
        content: "0 errors. 0 warnings. 47 open tabs. 3 empty coffee cups. Don't breathe on the keyboard or it might change its mind. 😂\n\n#DeveloperHumor #CodingLife #SoftwareEngineering #TechLife",
        favorite: false,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
        id: 4,
        userId: 1,
        topic: "Mastering High-Output Content Strategy",
        platform: "YouTube",
        tone: "Professional",
        content: "Welcome back to the studio! In this comprehensive masterclass, we break down the exact content architecture used to produce 100+ high-engagement assets per month without burnout.\n\n📌 Timestamps:\n00:00 - Introduction\n03:15 - Ideation Frameworks\n09:40 - Batching Captions & Long-form Chapters\n16:20 - Workflow Automation\n\nDon't forget to Like, Subscribe, and check the description for free templates! 🔔🎬\n\n#YouTubeCreators #ContentStrategy #VideoProduction #WorkflowHacks",
        favorite: false,
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
    }
];

let chapters = [
    {
        id: 1,
        userId: 1,
        title: "Chapter 1: The Anatomy of Modern Digital Storytelling",
        category: "Content Strategy",
        description: "Understanding how narrative structure drives user engagement across digital interfaces.",
        content: "<h2>The First Sentence Is Everything</h2><p>In an era characterized by micro-attention spans and infinite feeds, the traditional slow burn of long-form prose is rarely afforded grace. The reader must feel the heartbeat of your thesis within the first three seconds.</p><p>We define narrative velocity as the speed with which a thought travels from reader cognition into visceral emotion. To maximize this velocity, modern creators discard superfluous throat-clearing and launch immediately into tension.</p><h3>The Triad of Resonance</h3><ul><li><strong>The Paradox:</strong> Challenge a deeply held conventional assumption.</li><li><strong>The Mirror:</strong> Reflect the unspoken struggle of your reader.</li><li><strong>The Resolution:</strong> Offer an actionable, disciplined path forward.</li></ul><p>When these three vectors converge, language transcends mere text—it becomes an intellectual landmark.</p>",
        favorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 2,
        userId: 1,
        title: "Chapter 2: Engineering Resilient Cloud Software",
        category: "Technology",
        description: "A deep dive into decoupled system boundaries, microservices, and state reconciliation.",
        content: "<h2>Decoupling for Scale</h2><p>Software architecture is fundamentally the management of complexity over time. When services are tightly bound to concrete implementations, even minor updates introduce systemic fragility.</p><blockquote>\"Simplicity is prerequisite for reliability.\" — Edsger W. Dijkstra</blockquote><p>By enforcing strict boundary contracts through well-defined REST endpoints and event-driven architectures, distributed teams can build scalable applications that withstand unpredictable traffic spikes without performance degradation.</p>",
        favorite: false,
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 36).toISOString()
    }
];

// MIME types dictionary
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}

// ==========================================
// TOPIC-AWARE SEMANTIC GENERATION ENGINE
// ==========================================

function analyzeTopic(rawTopic) {
    const topic = (rawTopic || "Creative Concept").trim();
    const lower = topic.toLowerCase();

    let domain = 'GENERAL';
    if (/gym|fitness|workout|crossfit|training|trainer|bodybuilding|muscle|exercise|cardio|lifting|weights|squat|sweat|iron|yoga/.test(lower)) {
        domain = 'FITNESS';
    } else if (/iphone|apple|android|samsung|phone|smartphone|macbook|laptop|gadget|software|camera|silicon|ai|processor|tech|device|specs/.test(lower)) {
        domain = 'TECH';
    } else if (/coffee|cafe|café|latte|cappuccino|espresso|barista|brew|beans|bakery|restaurant|food|dining|brunch|breakfast|pizza|burger|dessert|chai|tea/.test(lower)) {
        domain = 'CAFE_FOOD';
    } else if (/travel|trip|manali|goa|mountain|mountains|snow|beach|vacation|roadtrip|himalayas|himachal|trek|hiking|wanderlust|scenic|getaway|valley/.test(lower)) {
        domain = 'TRAVEL';
    } else if (/clothing|t-shirt|tshirt|tee|hoodie|streetwear|fashion|brand|apparel|outfit|drip|fit|fabric|shoes|sneakers|wardrobe|collection|wear/.test(lower)) {
        domain = 'FASHION';
    } else if (/diwali|christmas|new year|holi|eid|sale|discount|offer|shopping|black friday|festive|deals|celebration|lights|fest/.test(lower)) {
        domain = 'FESTIVAL_SALE';
    } else if (/farewell|college|campus|graduation|batch|seniors|juniors|friends|convocation|memories|degrees|hostel|canteen/.test(lower)) {
        domain = 'CAMPUS_FAREWELL';
    } else if (/home|house|interior|decor|property|villa|apartment|living room|architecture/.test(lower)) {
        domain = 'REAL_ESTATE';
    } else if (/music|song|track|album|photography|photo|cinema|movie|film|art|painting|studio/.test(lower)) {
        domain = 'ART_MEDIA';
    }

    return { topic, domain, lower };
}

function buildDistinctCaption(p, platform, tone, length, optionIndex, seed) {
    const topic = p.topic;

    // 1. Hook Selection
    let hook = "";
    if (tone === "Gen-Z") {
        const hooks = [
            `not gonna lie, ${topic} just cleared every single expectation no cap 😭✨`,
            `the way ${topic} is giving absolute main character energy right now?? obsessing.`,
            `tell me why nobody warned me that ${topic} would be this iconic fr?!`,
            `POV: you finally experience ${topic} and life instantly upgrades 📈`,
            `if you haven't tapped into ${topic} yet, what are we even doing bestie? pure vibes only.`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (tone === "Cinematic") {
        const hooks = [
            `The curtains draw back. Under the gleaming spotlight, ${topic} makes its unforgettable entrance.`,
            `Every shadow, every detail, every contour crafted for this exact frame: ${topic}.`,
            `Moments suspended in time. When vision and atmosphere collide, ${topic} is born.`,
            `A quiet pulse before the crescendo—welcome to the era of ${topic}.`,
            `Beyond the ordinary horizon lies ${topic}. Witness the journey unfold.`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (tone === "Storytelling") {
        const hooks = [
            `It all started with an ambitious spark, and today ${topic} has finally become a reality.`,
            `Looking back at the weeks of relentless preparation, ${topic} represents so much more than just another milestone.`,
            `There's a story behind every single choice that brought ${topic} to life—and we're ready to share it.`,
            `From early sketches and late-night revisions to this exact moment: here is the real journey of ${topic}.`,
            `Some milestones mark the end of a chapter; ${topic} is where the real adventure begins.`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (p.domain === 'FITNESS') {
        const hooks = [
            `🚨 The iron is waiting! ${topic} is officially here to redefine your fitness journey.`,
            `No more excuses, no more waiting. Step into ${topic} and feel the energy from the very first rep.`,
            `Brand new equipment, certified trainers, and zero limits. Are you ready for ${topic}?`,
            `Behind every transformation is an environment built for grit. Welcome to ${topic}.`,
            `Your fitness breakthrough begins today. ${topic} has opened its doors—let's get to work! 💪`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (p.domain === 'TECH') {
        const hooks = [
            `⚡ The future of handheld engineering has arrived: say hello to ${topic}.`,
            `Unmatched processing power, surgical camera precision, and a design that turns heads. ${topic} is here.`,
            `Is ${topic} the biggest tech leap of the year? We spent hands-on time testing every spec.`,
            `Precision craftsmanship meets cutting-edge silicon. Here is our deep-dive review into ${topic}.`,
            `Next-generation performance is no longer an upgrade—it's a whole new standard with ${topic}.`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (p.domain === 'CAFE_FOOD') {
        const hooks = [
            `☕ Freshly roasted beans, warm golden microfoam, and the cozy aroma of ${topic}.`,
            `Your morning routine just found its holy grail. Welcome to your new favorite table at ${topic}.`,
            `Espresso or artisanal latte? Whatever your brew, ${topic} is crafting your daily dose of bliss.`,
            `Behind every velvety sip is a barista who obsesses over the perfect pull. Discover ${topic}.`,
            `Good coffee isn't a luxury—it's how the best days begin. Grab your cup at ${topic} ✨`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (p.domain === 'TRAVEL') {
        const hooks = [
            `🏔️ Snow-capped mountain peaks, pine-scented breeze, and total serenity: ${topic}.`,
            `Trading city traffic for alpine vistas and scenic winding roads on our journey to ${topic}.`,
            `Have you ever stood in awe of the mountains? That's the raw magic of ${topic}.`,
            `Chasing sunsets, crisp mountain air, and unforgettable memories across ${topic}.`,
            `The mountains are calling, and ${topic} is the ultimate answer to wanderlust 🎒❄️`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (p.domain === 'FASHION') {
        const hooks = [
            `🧵 Clean silhouettes, premium heavyweight cotton, and elevated streetwear: ${topic} has dropped.`,
            `Style that speaks before you say a word. Discover the bespoke fit and detail of ${topic}.`,
            `Oversized comfort or tailored precision? ${topic} delivers the ultimate wardrobe upgrade.`,
            `Engineered for everyday wear, built to turn heads. Here is the inspiration behind ${topic}.`,
            `The wait is over. Elevate your everyday drip with the all-new ${topic} collection 🔥👕`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (p.domain === 'FESTIVAL_SALE') {
        const hooks = [
            `✨ Shimmering lights, festive vibes, and massive celebrations: ${topic} is live now!`,
            `The biggest savings of the season have landed! Celebrate this festive joy with ${topic}.`,
            `Looking for the ultimate gifts for your loved ones? ${topic} brings you exclusive festive treats.`,
            `Celebrate auspicious beginnings with unbelievable price drops during ${topic}.`,
            `Hurry before stock runs out! Make your celebrations extra special with ${topic} 🎁🎉`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else if (p.domain === 'CAMPUS_FAREWELL') {
        const hooks = [
            `🎓 Walking into campus as strangers, walking out with a lifetime of memories: ${topic} 🤍`,
            `From endless canteen laughs to late-night submissions—here's celebrating the incredible journey of ${topic}.`,
            `How did four years fly by in the blink of an eye? Bittersweet emotions running high for ${topic}.`,
            `To the seniors who inspired us and the friends who became family: happy ${topic}!`,
            `Here’s to closing this golden chapter and conquering whatever comes next. Cheers to ${topic} 🥂`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    } else {
        const hooks = [
            `Introducing ${topic}—crafted with purpose and designed to make an immediate impact.`,
            `Experience ${topic} in a whole new light. Here is everything you need to know.`,
            `What makes ${topic} stand out from the rest? Let's break down the details.`,
            `A closer look at ${topic}: how dedication and precision shaped the final result.`,
            `The wait is officially over. Dive into ${topic} and see why everyone is talking about it.`
        ];
        hook = hooks[(optionIndex - 1) % hooks.length];
    }

    // 2. Body Selection
    let body = "";
    if (length !== "Short") {
        if (p.domain === 'FITNESS') {
            const bodies = [
                `Equipped with heavy-duty lifting racks, premium cardio machines, pristine locker rooms, and certified personal trainers ready to push you past your plateau.`,
                `Whether you're hitting personal bests on the squat rack or starting your first week of conditioning, our community is built to support your grind every step of the way.`,
                `Exclusive founder membership passes, personalized nutrition assessments, and group HIIT classes tailored for every fitness level.`,
                `We designed this space for people who value sweat, discipline, and real progress. High energy, zero intimidation, and top-tier coaching.`,
                `From morning power sessions to late-night lifts, ${topic} delivers the environment you need to build the strongest version of yourself.`
            ];
            body = bodies[(optionIndex - 1) % bodies.length];
        } else if (p.domain === 'TECH') {
            const bodies = [
                `Boasting a redesigned titanium enclosure, custom thermal architecture, and an advanced camera system engineered for cinematic low-light capture.`,
                `With all-day battery endurance, seamless ecosystem synchronicity, and blazing benchmark scores, this device redefines what mobile productivity feels like.`,
                `From computational AI photography to razor-sharp display refresh rates, every millimeter of ${topic} feels purpose-built for creators.`,
                `We benchmarked the battery, screen brightness, and processor under peak load. The real-world performance results speak for themselves.`,
                `Sleeker bezels, fluid tactile feedback, and next-generation charging speeds make ${topic} an undeniable flagship experience.`
            ];
            body = bodies[(optionIndex - 1) % bodies.length];
        } else if (p.domain === 'CAFE_FOOD') {
            const bodies = [
                `Single-origin beans roasted to perfection, paired with oven-fresh pastries and a cozy corner bathed in warm sunlight.`,
                `Whether you're typing away on your laptop or catching up on deep conversations with friends, our ambient acoustics and artisanal brews create the ideal sanctuary.`,
                `Sip through rich dark chocolate notes, velvety microfoam, and custom seasonal blends curated by our passionate baristas.`,
                `Made from ethically sourced beans and roasted in small batches to preserve every drop of authentic flavor.`,
                `Pull up a chair, inhale the fresh ground aroma, and savor food and drinks crafted with pure dedication.`
            ];
            body = bodies[(optionIndex - 1) % bodies.length];
        } else if (p.domain === 'TRAVEL') {
            const bodies = [
                `Waking up to chilly morning mist, walking through pine forests, and watching the sun paint the snow-covered peaks in shades of gold.`,
                `From thrilling mountain passes and cozy riverside cafes to starlit bonfires under freezing Himalayan skies, every second here is unforgettable.`,
                `The crisp alpine air, the warmth of hot chai at a roadside dhaba, and the breathtaking peace only the mountains can give you.`,
                `Stepping outside your comfort zone and discovering the quiet beauty of hidden trails, local villages, and panoramic valleys.`,
                `Nothing clears your mind quite like mountain roads, snowy horizons, and the thrill of exploring unexplored trails.`
            ];
            body = bodies[(optionIndex - 1) % bodies.length];
        } else if (p.domain === 'FASHION') {
            const bodies = [
                `Crafted with 240+ GSM pre-shrunk cotton, drop-shoulder silhouettes, and minimalist typography that effortlessly anchors any street fit.`,
                `Breathable all-day comfort meets refined tailoring. Designed to look just as sharp with relaxed denim as it does layered under a coat.`,
                `Limited edition batch with precision stitching and fade-resistant colorways built to outlast seasonal trends.`,
                `We obsessed over the collar tightness, hem length, and drape so you never have to second-guess what to throw on.`,
                `Available in versatile neutral tones and bold statement pieces. Elevate your wardrobe rotation starting today.`
            ];
            body = bodies[(optionIndex - 1) % bodies.length];
        } else if (p.domain === 'FESTIVAL_SALE') {
            const bodies = [
                `Enjoy up to 50% off sitewide, exclusive bundle deals, and complimentary festive gift wrapping on all your favorite picks.`,
                `From traditional handcrafted essentials to premium lifestyle upgrades, light up your home and celebrate with unmatched savings.`,
                `Limited-time festive discounts live right now across our entire catalog—grab your wishlist before the best items sell out!`,
                `Double your festive joy with special instant discounts, cashback offers, and hassle-free door delivery.`,
                `Celebrate auspicious moments with quality products curated to bring happiness, prosperity, and joy to your family.`
            ];
            body = bodies[(optionIndex - 1) % bodies.length];
        } else if (p.domain === 'CAMPUS_FAREWELL') {
            const bodies = [
                `From nervously walking into the orientation hall on day one to taking our final batch photos together, these walls hold our best years.`,
                `Thank you for the endless memories, the proxy attendances, the late-night exam cram sessions, and a friendship that will outlive any distance.`,
                `We laughed, we stressed over deadlines, we conquered festivals, and now we step out into the real world with full hearts.`,
                `A toast to the teachers who guided us, the campus that sheltered us, and the batchmates who made every single day worth remembering.`,
                `Goodbyes are never easy, but the memories created right here will stay with us forever as we chase our dreams.`
            ];
            body = bodies[(optionIndex - 1) % bodies.length];
        } else {
            const bodies = [
                `Built with attention to detail and focused on delivering real value. Every element has been tuned to provide an unmatched experience with ${topic}.`,
                `When strategy meets relentless execution, the outcome speaks for itself. ${topic} is setting a new benchmark for what's possible.`,
                `Explore how this was conceptualized, the creative decisions made along the way, and why it matters right now.`,
                `Clean, modern, and uncompromising in quality. Here is your complete guide to getting the most out of ${topic}.`,
                `Whether you're just discovering this for the first time or following along from the start, ${topic} represents a major leap forward.`
            ];
            body = bodies[(optionIndex - 1) % bodies.length];
        }
    }

    // 3. CTA Selection
    let cta = "";
    if (platform === "Instagram") {
        const ctas = [
            `Tap the link in bio to explore more! Drop your thoughts below 👇✨`,
            `Save this post for later and tag a friend who needs to see this! 💬`,
            `Double-tap if you agree and drop a 🔥 in the comments!`,
            `Swipe through to see the full details. Which one is your favorite? Tell us below!`,
            `Turn on post notifications so you never miss an update on ${topic} 🔔`
        ];
        cta = ctas[(optionIndex - 1) % ctas.length];
    } else if (platform === "LinkedIn") {
        const ctas = [
            `How does your team approach this in your industry? I'd welcome your thoughts in the comments.`,
            `If you found this perspective valuable, feel free to share it with your network.`,
            `What has been your biggest takeaway navigating ${topic}? Let's connect below.`,
            `Looking forward to hearing from fellow leaders on how this impacts upcoming strategies.`,
            `Agree or disagree? Share your point of view below.`
        ];
        cta = ctas[(optionIndex - 1) % ctas.length];
    } else if (platform === "Twitter/X") {
        const ctas = [
            `RT to spread the word. What's your take?`,
            `Bookmark this for your feed. Thoughts?`,
            `Drop your answer below 🧵👇`,
            `Quote tweet with your reaction!`,
            `Follow for daily breakdowns and drops 🚀`
        ];
        cta = ctas[(optionIndex - 1) % ctas.length];
    } else if (platform === "YouTube") {
        const ctas = [
            `Make sure to hit Like, Subscribe, and ring the notification bell for weekly releases! 🔔🎬`,
            `Check the description box below for full links, timestamps, and free resources! 👇`,
            `Leave a comment answering our question of the day—we reply to everyone in the first hour!`,
            `Share this video with someone who needs to see this today!`,
            `Subscribe to the studio channel and join our creator community 🚀`
        ];
        cta = ctas[(optionIndex - 1) % ctas.length];
    } else {
        const ctas = [
            `What do you think about this? Let's discuss in the comments below!`,
            `Tag someone who would love this and share to your feed!`,
            `Click the link to learn more and join the conversation today.`,
            `We want to hear your stories—share them with our community below!`,
            `Hit like and share if this made your day better!`
        ];
        cta = ctas[(optionIndex - 1) % ctas.length];
    }

    let result = hook;
    if (body) {
        result += "\n\n" + body;
    }
    result += "\n\n" + cta;

    if (platform === "Twitter/X" && result.length > 270) {
        result = hook + " " + cta;
        if (result.length > 270) {
            result = result.substring(0, 260) + "...";
        }
    }

    return result;
}

function buildTopicHashtags(p, platform, optionIndex, seed) {
    const cleanTag = p.topic.replace(/[^a-zA-Z0-9]/g, '');
    const baseTag = `#${cleanTag}`;

    let domainTags = [];
    if (p.domain === 'FITNESS') {
        domainTags = ["#NewGym", "#GymLife", "#FitnessJourney", "#WorkoutMotivation", "#GymOpening", "#FitFam", "#TrainHard", "#FitnessCommunity"];
    } else if (p.domain === 'TECH') {
        domainTags = ["#TechNews", "#SmartphoneTech", "#FlagshipSpecs", "#NextGenTech", "#GadgetLover", "#Innovation", "#TechUnboxing"];
    } else if (p.domain === 'CAFE_FOOD') {
        domainTags = ["#CoffeeLovers", "#CafeAesthetic", "#ArtisanalRoast", "#LatteArt", "#CoffeeShopVibes", "#FreshlyBrewed", "#CafeCulture"];
    } else if (p.domain === 'TRAVEL') {
        domainTags = ["#TravelDiaries", "#MountainVibes", "#SnowTrails", "#Wanderlust", "#ExploreNature", "#IncredibleJourneys", "#TravelGram"];
    } else if (p.domain === 'FASHION') {
        domainTags = ["#StreetwearStyle", "#FashionDrop", "#TeeCollection", "#OOTD", "#OutfitInspo", "#ElevatedBasics", "#ClothingBrand"];
    } else if (p.domain === 'FESTIVAL_SALE') {
        domainTags = ["#FestiveSale", "#MegaDiscounts", "#FestivalOfLights", "#ShoppingSpree", "#ExclusiveDeals", "#FestiveOffers"];
    } else if (p.domain === 'CAMPUS_FAREWELL') {
        domainTags = ["#CollegeFarewell", "#CampusDiaries", "#BatchMemories", "#GraduationVibes", "#FarewellParty", "#LifelongFriends"];
    } else if (p.domain === 'REAL_ESTATE') {
        domainTags = ["#DreamHome", "#InteriorDesign", "#HomeDecor", "#ModernLiving", "#ArchitectureInspo"];
    } else if (p.domain === 'ART_MEDIA') {
        domainTags = ["#CreativeStudio", "#ArtisticVision", "#CinematicMood", "#VisualStory", "#BehindTheLens"];
    } else {
        domainTags = ["#TrendingNow", "#Creativity", "#Innovation", "#MustHave"];
    }

    const set = new Set();
    set.add(baseTag);
    const start = (optionIndex + (seed || 0)) % domainTags.length;
    for (let i = 0; i < domainTags.length && set.size < 6; i++) {
        set.add(domainTags[(start + i) % domainTags.length]);
    }
    return Array.from(set);
}

const server = http.createServer(async (req, res) => {
    // Handle CORS Pre-flight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // ==========================================
    // REST API ROUTING (/api/**)
    // ==========================================

    // Auth APIs
    if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await parseBody(req);
        const user = users.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase());
        if (user && user.password === body.password) {
            return sendJson(res, 200, {
                success: true,
                message: "Login successful",
                data: {
                    token: "jwt-token-" + Buffer.from(user.email).toString('base64'),
                    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
                }
            });
        }
        if (body.email === "demo@captionstudio.com") {
            const demoUser = users[0];
            return sendJson(res, 200, {
                success: true,
                message: "Login successful",
                data: {
                    token: "jwt-token-demo",
                    user: { id: demoUser.id, name: demoUser.name, email: demoUser.email, createdAt: demoUser.createdAt }
                }
            });
        }
        return sendJson(res, 400, { success: false, message: "Invalid email address or password" });
    }

    if (pathname === '/api/auth/register' && req.method === 'POST') {
        const body = await parseBody(req);
        if (!body.name || !body.email || !body.password) {
            return sendJson(res, 400, { success: false, message: "All fields are required" });
        }
        const newUser = {
            id: Date.now(),
            name: body.name,
            email: body.email.toLowerCase(),
            password: body.password,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        return sendJson(res, 200, {
            success: true,
            message: "Registration successful",
            data: {
                token: "jwt-token-" + Buffer.from(newUser.email).toString('base64'),
                user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt }
            }
        });
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
        return sendJson(res, 200, { success: true, message: "Logged out successfully" });
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
        return sendJson(res, 200, { success: true, data: users[0] });
    }

    if (pathname === '/api/auth/profile' && req.method === 'PUT') {
        const body = await parseBody(req);
        users[0].name = body.name || users[0].name;
        users[0].email = body.email || users[0].email;
        if (body.newPassword) users[0].password = body.newPassword;
        return sendJson(res, 200, { success: true, message: "Profile updated", data: users[0] });
    }

    // Caption Generator API (5 Topic-Aware Options)
    if (pathname === '/api/captions/generate' && req.method === 'POST') {
        const body = await parseBody(req);
        const profile = analyzeTopic(body.topic);
        const platform = body.platform || "Instagram";
        const tone = body.tone || "Professional";
        const length = body.length || "Medium";
        const includeHashtags = body.hashtagEnabled !== undefined ? body.hashtagEnabled : (body.includeHashtags !== false);
        const seed = body.seed || Math.floor(Math.random() * 100);

        const options = [];
        for (let i = 1; i <= 5; i++) {
            let content = buildDistinctCaption(profile, platform, tone, length, i, seed);
            const tags = buildTopicHashtags(profile, platform, i, seed);
            if (includeHashtags) {
                content += "\n\n" + tags.join(' ');
            }
            options.push({
                content: content.trim(),
                hashtags: tags,
                formattedHashtags: tags.join(' ')
            });
        }

        return sendJson(res, 200, {
            success: true,
            message: "5 captions generated successfully",
            captions: options,
            data: {
                captions: options,
                primaryCaption: options[0].content,
                alternativeCaption: options[1].content,
                hashtags: options[0].hashtags,
                formattedHashtags: options[0].formattedHashtags,
                platform,
                tone,
                length
            }
        });
    }

    // Captions CRUD
    if (pathname === '/api/captions' && req.method === 'GET') {
        const platform = parsedUrl.query.platform;
        const search = (parsedUrl.query.search || '').toLowerCase();
        const favOnly = parsedUrl.query.favorite === 'true';

        let list = [...captions];
        if (platform && platform !== 'all') {
            list = list.filter(c => c.platform.toLowerCase() === platform.toLowerCase());
        }
        if (search) {
            list = list.filter(c => c.topic.toLowerCase().includes(search) || c.content.toLowerCase().includes(search));
        }
        if (favOnly) {
            list = list.filter(c => Boolean(c.favorite));
        }
        return sendJson(res, 200, { success: true, data: list });
    }

    if (pathname === '/api/captions' && req.method === 'POST') {
        const body = await parseBody(req);
        const newCap = {
            id: Date.now(),
            userId: 1,
            topic: body.topic,
            platform: body.platform,
            tone: body.tone,
            content: body.content,
            favorite: Boolean(body.favorite),
            createdAt: new Date().toISOString()
        };
        captions.unshift(newCap);
        return sendJson(res, 200, { success: true, message: "Caption saved", data: newCap });
    }

    if (pathname.startsWith('/api/captions/') && pathname.endsWith('/favorite') && req.method === 'PUT') {
        const id = parseInt(pathname.split('/')[3]);
        const target = captions.find(c => c.id === id);
        if (target) {
            target.favorite = !target.favorite;
            return sendJson(res, 200, { success: true, message: "Favorite toggled", data: target });
        }
        return sendJson(res, 404, { success: false, message: "Caption not found" });
    }

    if (pathname.startsWith('/api/captions/') && req.method === 'PUT') {
        const id = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const target = captions.find(c => c.id === id);
        if (target) {
            target.topic = body.topic || target.topic;
            target.platform = body.platform || target.platform;
            target.tone = body.tone || target.tone;
            target.content = body.content || target.content;
            return sendJson(res, 200, { success: true, message: "Caption updated", data: target });
        }
        return sendJson(res, 404, { success: false, message: "Caption not found" });
    }

    if (pathname.startsWith('/api/captions/') && req.method === 'DELETE') {
        const id = parseInt(pathname.split('/')[3]);
        captions = captions.filter(c => c.id !== id);
        return sendJson(res, 200, { success: true, message: "Caption deleted" });
    }

    // Chapters CRUD
    if (pathname === '/api/chapters' && req.method === 'GET') {
        const category = parsedUrl.query.category;
        const search = (parsedUrl.query.search || '').toLowerCase();
        const favOnly = parsedUrl.query.favorite === 'true';

        let list = [...chapters];
        if (category && category !== 'all') {
            list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
            list = list.filter(c => c.title.toLowerCase().includes(search) || (c.content && c.content.toLowerCase().includes(search)));
        }
        if (favOnly) {
            list = list.filter(c => Boolean(c.favorite));
        }
        return sendJson(res, 200, { success: true, data: list });
    }

    if (pathname === '/api/chapters' && req.method === 'POST') {
        const body = await parseBody(req);
        const newChap = {
            id: Date.now(),
            userId: 1,
            title: body.title,
            category: body.category || 'General',
            description: body.description || '',
            content: body.content,
            favorite: Boolean(body.favorite),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        chapters.unshift(newChap);
        return sendJson(res, 200, { success: true, message: "Chapter published", data: newChap });
    }

    if (pathname.startsWith('/api/chapters/') && pathname.endsWith('/favorite') && req.method === 'PUT') {
        const id = parseInt(pathname.split('/')[3]);
        const target = chapters.find(c => c.id === id);
        if (target) {
            target.favorite = !target.favorite;
            return sendJson(res, 200, { success: true, message: "Favorite toggled", data: target });
        }
        return sendJson(res, 404, { success: false, message: "Chapter not found" });
    }

    if (pathname.startsWith('/api/chapters/') && req.method === 'PUT') {
        const id = parseInt(pathname.split('/')[3]);
        const body = await parseBody(req);
        const target = chapters.find(c => c.id === id);
        if (target) {
            target.title = body.title || target.title;
            target.category = body.category || target.category;
            target.description = body.description || target.description;
            target.content = body.content || target.content;
            target.updatedAt = new Date().toISOString();
            return sendJson(res, 200, { success: true, message: "Chapter updated", data: target });
        }
        return sendJson(res, 404, { success: false, message: "Chapter not found" });
    }

    if (pathname.startsWith('/api/chapters/') && req.method === 'DELETE') {
        const id = parseInt(pathname.split('/')[3]);
        chapters = chapters.filter(c => c.id !== id);
        return sendJson(res, 200, { success: true, message: "Chapter deleted" });
    }

    // Dashboard Stats API
    if (pathname === '/api/dashboard/stats' && req.method === 'GET') {
        const totalWords = chapters.reduce((acc, c) => {
            const plain = (c.content || '').replace(/<[^>]*>/g, ' ');
            const words = plain.trim().split(/\s+/).filter(Boolean);
            return acc + words.length;
        }, 0);

        return sendJson(res, 200, {
            success: true,
            data: {
                totalCaptions: captions.length,
                totalChapters: chapters.length,
                totalFavorites: captions.filter(c => c.favorite).length + chapters.filter(c => c.favorite).length,
                totalWords: totalWords,
                recentCaptions: captions.slice(0, 5),
                recentChapters: chapters.slice(0, 5)
            }
        });
    }

    // ==========================================
    // STATIC FILE SERVING
    // ==========================================
    let filePath = path.join(FRONTEND_DIR, pathname === '/' ? 'index.html' : pathname);

    if (!fs.existsSync(filePath)) {
        if (fs.existsSync(filePath + '.html')) {
            filePath += '.html';
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
    }

    if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 Internal Server Error: ' + err.message);
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            });
            res.end(content);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================================`);
    console.log(`🚀 Caption & Chapter Studio is live on localhost!`);
    console.log(`🌐 Website URL:    http://localhost:${PORT}`);
    console.log(`📑 REST APIs:      http://localhost:${PORT}/api`);
    console.log(`👤 Demo Account:   demo@captionstudio.com  /  Demo@1234`);
    console.log(`==================================================================`);
});
