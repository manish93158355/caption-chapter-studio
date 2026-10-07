/**
 * Caption & Chapter Studio - Main Application Framework & API Client
 */

// Global App Configuration
const API_BASE_URL = '/api';

const STORAGE_KEYS = {
    TOKEN: 'ccs_token',
    USER: 'ccs_user',
    LOCAL_CAPTIONS: 'ccs_local_captions',
    LOCAL_CHAPTERS: 'ccs_local_chapters'
};

// ==========================================
// AUTHENTICATION & SESSION MANAGEMENT
// ==========================================

function getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
}

function setToken(token, remember = false) {
    if (remember) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
}

function getUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function setUser(user, remember = false) {
    const serialized = JSON.stringify(user);
    if (remember) {
        localStorage.setItem(STORAGE_KEYS.USER, serialized);
    } else {
        sessionStorage.setItem(STORAGE_KEYS.USER, serialized);
    }
}

function clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
}

function requireAuth() {
    const token = getToken();
    if (!token) {
        // Save redirect path
        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
        if (currentPath !== 'login.html' && currentPath !== 'signup.html' && currentPath !== 'index.html') {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPath);
        }
        return false;
    }
    return true;
}

function logoutUser() {
    apiCall('/auth/logout', 'POST', null, false).catch(() => {});
    clearAuth();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 400);
}

// ==========================================
// UNIFIED REST API CLIENT WITH FALLBACK
// ==========================================

async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    if (requiresAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const config = {
        method,
        headers
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json();

        if (response.status === 401 && requiresAuth) {
            clearAuth();
            window.location.href = 'login.html';
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error(result.message || 'Server returned an error');
        }

        return result;
    } catch (err) {
        // If the backend server is unreachable (Failed to fetch), transparently provide local mock fallback
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Network Error')) {
            console.warn(`[Backend Offline] Using client fallback for ${method} ${endpoint}`);
            return handleLocalFallback(endpoint, method, data);
        }
        throw err;
    }
}

// Client Fallback Mode when Spring Boot backend is not yet started
function handleLocalFallback(endpoint, method, data) {
    // 1. Auth Fallback
    if (endpoint === '/auth/login') {
        const mockUser = { id: 1, name: "Alex Mercer", email: data.email || "demo@captionstudio.com", createdAt: new Date().toISOString() };
        return { success: true, message: "Logged in (Offline Mode)", data: { token: "mock-jwt-token-12345", user: mockUser } };
    }
    if (endpoint === '/auth/register') {
        const mockUser = { id: Date.now(), name: data.name, email: data.email, createdAt: new Date().toISOString() };
        return { success: true, message: "Account created (Offline Mode)", data: { token: "mock-jwt-token-67890", user: mockUser } };
    }
    if (endpoint === '/auth/me') {
        const user = getUser() || { id: 1, name: "Alex Mercer", email: "demo@captionstudio.com", createdAt: new Date().toISOString() };
        return { success: true, data: user };
    }
    if (endpoint === '/auth/profile') {
        const user = getUser() || { id: 1, name: data.name, email: data.email, createdAt: new Date().toISOString() };
        user.name = data.name;
        user.email = data.email;
        setUser(user, true);
        return { success: true, data: user };
    }

    // 2. Caption Generator Fallback (Client Template Engine)
    if (endpoint === '/captions/generate') {
        return { success: true, data: generateMockCaption(data) };
    }

    // 3. Captions CRUD Fallback
    let captions = getStorageArray(STORAGE_KEYS.LOCAL_CAPTIONS, getDefaultMockCaptions());
    if (endpoint.startsWith('/captions')) {
        if (method === 'GET' && !endpoint.includes('/', 10)) {
            return { success: true, data: captions };
        }
        if (method === 'POST') {
            const newCaption = { id: Date.now(), ...data, favorite: data.favorite || false, createdAt: new Date().toISOString() };
            captions.unshift(newCaption);
            setStorageArray(STORAGE_KEYS.LOCAL_CAPTIONS, captions);
            return { success: true, data: newCaption };
        }
        if (endpoint.includes('/favorite')) {
            const id = parseInt(endpoint.split('/')[2]);
            const target = captions.find(c => c.id === id);
            if (target) {
                target.favorite = !target.favorite;
                setStorageArray(STORAGE_KEYS.LOCAL_CAPTIONS, captions);
                return { success: true, data: target };
            }
        }
        if (method === 'DELETE') {
            const id = parseInt(endpoint.split('/')[2]);
            captions = captions.filter(c => c.id !== id);
            setStorageArray(STORAGE_KEYS.LOCAL_CAPTIONS, captions);
            return { success: true, message: "Caption deleted" };
        }
    }

    // 4. Chapters CRUD Fallback
    let chapters = getStorageArray(STORAGE_KEYS.LOCAL_CHAPTERS, getDefaultMockChapters());
    if (endpoint.startsWith('/chapters')) {
        if (method === 'GET' && !endpoint.includes('/', 10)) {
            return { success: true, data: chapters };
        }
        if (method === 'POST') {
            const newChap = { id: Date.now(), ...data, favorite: data.favorite || false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            chapters.unshift(newChap);
            setStorageArray(STORAGE_KEYS.LOCAL_CHAPTERS, chapters);
            return { success: true, data: newChap };
        }
        if (endpoint.includes('/favorite')) {
            const id = parseInt(endpoint.split('/')[2]);
            const target = chapters.find(c => c.id === id);
            if (target) {
                target.favorite = !target.favorite;
                setStorageArray(STORAGE_KEYS.LOCAL_CHAPTERS, chapters);
                return { success: true, data: target };
            }
        }
        if (method === 'DELETE') {
            const id = parseInt(endpoint.split('/')[2]);
            chapters = chapters.filter(c => c.id !== id);
            setStorageArray(STORAGE_KEYS.LOCAL_CHAPTERS, chapters);
            return { success: true, message: "Chapter deleted" };
        }
    }

    // 5. Dashboard Stats Fallback
    if (endpoint === '/dashboard/stats') {
        const totalWords = chapters.reduce((acc, c) => acc + (c.content ? c.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0), 0);
        return {
            success: true,
            data: {
                totalCaptions: captions.length,
                totalChapters: chapters.length,
                totalFavorites: captions.filter(c => c.favorite).length + chapters.filter(c => c.favorite).length,
                totalWords: totalWords,
                recentCaptions: captions.slice(0, 5),
                recentChapters: chapters.slice(0, 5)
            }
        };
    }

    return { success: true, data: null };
}

function getStorageArray(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function setStorageArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}

function getDefaultMockCaptions() {
    return [{
            id: 1,
            topic: "Next-Gen SaaS Launch",
            platform: "Instagram",
            tone: "Professional",
            content: "Something extraordinary has arrived. Designed with meticulous attention to detail and built for creators who value craftsmanship.\n\nTake your digital workflow into the next dimension. Tap the link in bio to experience Caption & Chapter Studio early. 🚀✨\n\n#SaaSProduct #ContentCreation #ProductLaunch #Productivity #CreativeTools #Innovation",
            favorite: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            topic: "3 Principles for High-Converting Copy",
            platform: "LinkedIn",
            tone: "Motivational",
            content: "Great copy isn't written—it is carved out of human psychology.\n\nHere are 3 mental shifts that doubled our audience retention:\n1. Hook with empathy, not hype.\n2. Sell the transformation, not the feature.\n3. Make your Call to Action effortless.\n\nWhich of these 3 are you prioritizing this quarter? Let's discuss in the comments.\n\n#Copywriting #AudienceGrowth #MarketingStrategy #Leadership #CareerGrowth",
            favorite: true,
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
    ];
}

function getDefaultMockChapters() {
    return [{
        id: 1,
        title: "Chapter 1: The Anatomy of Modern Digital Storytelling",
        category: "Content Strategy",
        description: "Understanding how narrative structure drives user engagement across digital interfaces.",
        content: "<h2>The First Sentence Is Everything</h2><p>In an era characterized by micro-attention spans and infinite feeds, the traditional slow burn of long-form prose is rarely afforded grace. The reader must feel the heartbeat of your thesis within the first three seconds.</p><p>We define narrative velocity as the speed with which a thought travels from reader cognition into visceral emotion.</p><h3>The Triad of Resonance</h3><ul><li><strong>The Paradox:</strong> Challenge a deeply held conventional assumption.</li><li><strong>The Mirror:</strong> Reflect the unspoken struggle of your reader.</li><li><strong>The Resolution:</strong> Offer an actionable, disciplined path forward.</li></ul>",
        favorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }];
}

function generateMockCaption(req) {
    const topic = (req.topic || "Creative Concept").trim();
    const platform = req.platform || "Instagram";
    const tone = req.tone || "Professional";
    const length = req.length || "Medium";
    const cleanTag = topic.replace(/[^a-zA-Z0-9]/g, '');
    const baseTag = `#${cleanTag}`;

    const lower = topic.toLowerCase();
    let domainTags = ["#TrendingNow", "#Creativity", "#Innovation", "#MustHave"];
    if (/gym|fitness|workout|crossfit|training/.test(lower)) {
        domainTags = ["#NewGym", "#GymLife", "#FitnessJourney", "#WorkoutMotivation", "#GymOpening", "#FitFam"];
    } else if (/iphone|apple|android|phone|tech|gadget/.test(lower)) {
        domainTags = ["#TechNews", "#SmartphoneTech", "#FlagshipSpecs", "#NextGenTech", "#GadgetLover"];
    } else if (/coffee|cafe|latte|espresso|brew/.test(lower)) {
        domainTags = ["#CoffeeLovers", "#CafeAesthetic", "#ArtisanalRoast", "#LatteArt", "#CoffeeShopVibes"];
    } else if (/travel|manali|mountain|snow|trip|beach/.test(lower)) {
        domainTags = ["#TravelDiaries", "#MountainVibes", "#SnowTrails", "#Wanderlust", "#ExploreNature"];
    } else if (/clothing|t-shirt|tee|fashion|brand|apparel/.test(lower)) {
        domainTags = ["#StreetwearStyle", "#FashionDrop", "#TeeCollection", "#OOTD", "#OutfitInspo"];
    }

    const captions = [];
    const hooks = [
        `🚨 Introducing ${topic}—designed to make an immediate, unforgettable impact.`,
        `Experience ${topic} in a whole new dimension. The wait is officially over.`,
        `What makes ${topic} stand out from everything else? Let's break down the details.`,
        `A closer look at ${topic}: how dedication, craft, and vision shaped the final result.`,
        `The countdown is over! Step into ${topic} and discover why everyone is talking about this.`
    ];

    for (let i = 0; i < 5; i++) {
        const tags = [baseTag, domainTags[i % domainTags.length], domainTags[(i + 1) % domainTags.length]];
        const content = `${hooks[i]}\n\nBuilt with attention to detail and focused on delivering real value. Every element has been tuned to provide an unmatched experience with ${topic}.\n\nTap the link or drop your thoughts below! 👇\n\n${tags.join(' ')}`;
        captions.push({
            content,
            hashtags: tags,
            formattedHashtags: tags.join(' ')
        });
    }

    return {
        captions,
        primaryCaption: captions[0].content,
        alternativeCaption: captions[1].content,
        hashtags: captions[0].hashtags,
        formattedHashtags: captions[0].formattedHashtags,
        platform,
        tone,
        length
    };
}

// ==========================================
// TOAST NOTIFICATIONS SYSTEM
// ==========================================

function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '⚡';

    toast.innerHTML = `
        <span style="font-weight: bold; font-size: 1.1rem;">${icon}</span>
        <span style="flex: 1;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==========================================
// CLIPBOARD COPY UTILITY
// ==========================================

async function copyToClipboard(text, customMessage = 'Copied to clipboard!') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(customMessage, 'success');
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(customMessage, 'success');
    }
}

// ==========================================
// UI SHELL INITIALIZER (Sidebar, User Info)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Sidebar Hamburger Toggle
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.app-sidebar');

    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !hamburgerBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // 2. Populate User Profile Badge in Sidebar / Topbar
    const user = getUser();
    if (user) {
        const nameElements = document.querySelectorAll('.user-info-name');
        nameElements.forEach(el => el.textContent = user.name || 'Creator');

        const avatarElements = document.querySelectorAll('.user-avatar');
        avatarElements.forEach(el => {
            const initials = (user.name || 'CC')
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
            el.textContent = initials;
        });
    }

    // 3. Highlight current page link in sidebar
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navLinks = document.querySelectorAll('.sidebar-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 4. Bind Logout Button if present
    const logoutBtns = document.querySelectorAll('.btn-logout-action');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to sign out?')) {
                logoutUser();
            }
        });
    });
});