/**
 * Caption & Chapter Studio - Dashboard Analytics & Activity Hub
 */

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth()) return;

    setupGreeting();
    await loadDashboardStats();
});

function setupGreeting() {
    const user = getUser();
    const greetingEl = document.getElementById('user-greeting');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let timeGreeting = 'Good evening';
    if (hour < 12) {
        timeGreeting = 'Good morning';
    } else if (hour < 17) {
        timeGreeting = 'Good afternoon';
    }

    const userName = user ? user.name.split(' ')[0] : 'Creator';
    greetingEl.textContent = `${timeGreeting}, ${userName}!`;
}

async function loadDashboardStats() {
    try {
        const response = await apiCall('/dashboard/stats', 'GET');
        if (response.success && response.data) {
            renderStats(response.data);
            renderRecentCaptions(response.data.recentCaptions || []);
            renderRecentChapters(response.data.recentChapters || []);
        }
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        showToast('Could not refresh latest stats', 'warning');
    }
}

function renderStats(stats) {
    const totalCaptionsEl = document.getElementById('stat-total-captions');
    const totalChaptersEl = document.getElementById('stat-total-chapters');
    const totalFavoritesEl = document.getElementById('stat-total-favorites');
    const totalWordsEl = document.getElementById('stat-total-words');

    if (totalCaptionsEl) totalCaptionsEl.textContent = stats.totalCaptions || 0;
    if (totalChaptersEl) totalChaptersEl.textContent = stats.totalChapters || 0;
    if (totalFavoritesEl) totalFavoritesEl.textContent = stats.totalFavorites || 0;
    if (totalWordsEl) totalWordsEl.textContent = Number(stats.totalWords || 0).toLocaleString();
}

function renderRecentCaptions(captions) {
    const container = document.getElementById('recent-captions-container');
    if (!container) return;

    if (!captions || captions.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem 1rem;">
                <p class="empty-state-text">No captions created yet. Generate your first one!</p>
                <a href="captions.html" class="btn btn-primary btn-sm">Create Caption</a>
            </div>
        `;
        return;
    }

    container.innerHTML = captions.map(c => `
        <div class="glass-card" style="padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="badge badge-platform-${c.platform.toLowerCase().replace('/', '')}">${c.platform}</span>
                <span class="badge badge-tone">${c.tone}</span>
            </div>
            <p style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                ${escapeHtml(c.content)}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                <span>${formatDate(c.createdAt)}</span>
                <button class="btn btn-secondary btn-sm" onclick="copyToClipboard(\`${escapeAttr(c.content)}\`)">Copy</button>
            </div>
        </div>
    `).join('');
}

function renderRecentChapters(chapters) {
    const container = document.getElementById('recent-chapters-container');
    if (!container) return;

    if (!chapters || chapters.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem 1rem;">
                <p class="empty-state-text">No chapters written yet. Start your next story!</p>
                <a href="chapters.html" class="btn btn-primary btn-sm">Write Chapter</a>
            </div>
        `;
        return;
    }

    container.innerHTML = chapters.map(ch => {
        const plainText = (ch.content || '').replace(/<[^>]*>/g, ' ');
        const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        return `
            <div class="glass-card" style="padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 0.85rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span class="badge badge-category">${ch.category || 'General'}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${readTime} min read</span>
                </div>
                <h4 style="font-size: 0.95rem; margin-bottom: 0.35rem; color: var(--text-primary);">${escapeHtml(ch.title)}</h4>
                <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${escapeHtml(ch.description || plainText)}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                    <span>${wordCount} words</span>
                    <a href="chapters.html?open=${ch.id}" class="btn btn-secondary btn-sm">Open</a>
                </div>
            </div>
        `;
    }).join('');
}

function formatDate(dateStr) {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
