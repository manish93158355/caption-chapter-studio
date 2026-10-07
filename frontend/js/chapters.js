/**
 * Caption & Chapter Studio - Long-Form Chapter Writer & Reader Studio
 */

let allChapters = [];
let currentEditingChapterId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth()) return;

    setupEditorToolbar();
    setupEditorMetrics();
    setupChapterForm();
    setupFiltersAndSearch();
    await loadChapters();

    // Check if URL has ?open=ID parameter
    const urlParams = new URLSearchParams(window.location.search);
    const openId = urlParams.get('open');
    if (openId) {
        setTimeout(() => openChapterReaderModal(parseInt(openId)), 300);
    }
});

// ==========================================
// 1. WYSIWYG EDITOR TOOLBAR & METRICS
// ==========================================

function setupEditorToolbar() {
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const editor = document.getElementById('chapter-editor');

    toolbarButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const command = btn.getAttribute('data-command');
            const arg = btn.getAttribute('data-arg') || null;

            if (command === 'formatBlock') {
                document.execCommand(command, false, `<${arg}>`);
            } else if (command === 'createLink') {
                const url = prompt('Enter the link URL:', 'https://');
                if (url) document.execCommand(command, false, url);
            } else {
                document.execCommand(command, false, arg);
            }

            editor.focus();
            updateMetrics();
        });
    });
}

function setupEditorMetrics() {
    const editor = document.getElementById('chapter-editor');
    if (!editor) return;

    editor.addEventListener('input', () => {
        updateMetrics();
    });
}

function updateMetrics() {
    const editor = document.getElementById('chapter-editor');
    const wordCountEl = document.getElementById('editor-word-count');
    const charCountEl = document.getElementById('editor-char-count');
    const readTimeEl = document.getElementById('editor-read-time');

    if (!editor) return;

    const text = editor.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length === 1 && words[0] === '' ? 0 : words.length;
    const charCount = text.length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

    if (wordCountEl) wordCountEl.textContent = `${wordCount} words`;
    if (charCountEl) charCountEl.textContent = `${charCount} characters`;
    if (readTimeEl) readTimeEl.textContent = `~${readMinutes} min read`;
}

// ==========================================
// 2. CHAPTER CREATION & SAVING
// ==========================================

function setupChapterForm() {
    const saveBtn = document.getElementById('btn-save-chapter');
    const clearBtn = document.getElementById('btn-clear-chapter');

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            resetEditor();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const titleInput = document.getElementById('chapter-title');
            const categoryInput = document.getElementById('chapter-category');
            const descInput = document.getElementById('chapter-description');
            const editor = document.getElementById('chapter-editor');

            const title = titleInput.value.trim();
            const category = categoryInput.value.trim() || 'General';
            const description = descInput.value.trim();
            const content = editor.innerHTML.trim();

            if (!title) {
                showToast('Please enter a chapter title', 'warning');
                titleInput.focus();
                return;
            }
            if (!content || content === '<br>' || editor.innerText.trim() === '') {
                showToast('Chapter content cannot be empty', 'warning');
                editor.focus();
                return;
            }

            const originalText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<span>Saving...</span>`;

            try {
                if (currentEditingChapterId) {
                    // Update Chapter
                    const response = await apiCall(`/chapters/${currentEditingChapterId}`, 'PUT', {
                        title,
                        category,
                        description,
                        content
                    });

                    if (response.success) {
                        showToast('Chapter updated successfully!', 'success');
                        resetEditor();
                        await loadChapters();
                    }
                } else {
                    // Create New Chapter
                    const response = await apiCall('/chapters', 'POST', {
                        title,
                        category,
                        description,
                        content,
                        favorite: false
                    });

                    if (response.success) {
                        showToast('Chapter published to your library!', 'success');
                        resetEditor();
                        await loadChapters();
                    }
                }
            } catch (err) {
                showToast(err.message || 'Error saving chapter', 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        });
    }
}

function resetEditor() {
    currentEditingChapterId = null;
    document.getElementById('chapter-title').value = '';
    document.getElementById('chapter-category').value = '';
    document.getElementById('chapter-description').value = '';
    const editor = document.getElementById('chapter-editor');
    editor.innerHTML = '';
    updateMetrics();

    const saveBtn = document.getElementById('btn-save-chapter');
    if (saveBtn) saveBtn.innerHTML = `<span>Save Chapter</span>`;

    const statusEl = document.getElementById('editor-status-mode');
    if (statusEl) statusEl.textContent = 'New Chapter';
}

// ==========================================
// 3. CHAPTERS LIBRARY, FILTER & SEARCH
// ==========================================

async function loadChapters() {
    const listContainer = document.getElementById('chapters-list');
    if (!listContainer) return;

    try {
        const response = await apiCall('/chapters', 'GET');
        if (response.success && response.data) {
            allChapters = response.data;
            populateCategoryFilterOptions();
            applyChapterFilters();
        }
    } catch (err) {
        console.error('Error loading chapters:', err);
        showToast('Could not load chapters', 'error');
    }
}

function populateCategoryFilterOptions() {
    const select = document.getElementById('filter-category');
    if (!select) return;

    const categories = Array.from(new Set(allChapters.map(c => c.category).filter(Boolean)));
    const currentVal = select.value;

    select.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
        select.innerHTML += `<option value="${escapeAttr(cat)}">${escapeHtml(cat)}</option>`;
    });

    select.value = currentVal;
}

function setupFiltersAndSearch() {
    const searchInput = document.getElementById('search-chapters');
    const categoryFilter = document.getElementById('filter-category');
    const favFilter = document.getElementById('filter-chapter-fav-only');

    if (searchInput) searchInput.addEventListener('input', () => applyChapterFilters());
    if (categoryFilter) categoryFilter.addEventListener('change', () => applyChapterFilters());
    if (favFilter) favFilter.addEventListener('change', () => applyChapterFilters());
}

function applyChapterFilters() {
    const searchVal = (document.getElementById('search-chapters')?.value || '').toLowerCase().trim();
    const categoryVal = document.getElementById('filter-category')?.value || 'all';
    const favOnly = document.getElementById('filter-chapter-fav-only')?.checked || false;

    const filtered = allChapters.filter(ch => {
        const matchesSearch = !searchVal ||
            (ch.title && ch.title.toLowerCase().includes(searchVal)) ||
            (ch.description && ch.description.toLowerCase().includes(searchVal)) ||
            (ch.content && ch.content.toLowerCase().includes(searchVal));

        const matchesCat = categoryVal === 'all' || 
            (ch.category && ch.category.toLowerCase() === categoryVal.toLowerCase());

        const matchesFav = !favOnly || Boolean(ch.favorite);

        return matchesSearch && matchesCat && matchesFav;
    });

    renderChaptersGrid(filtered);
}

function renderChaptersGrid(chapters) {
    const container = document.getElementById('chapters-list');
    const countBadge = document.getElementById('chapters-count-badge');
    if (!container) return;

    if (countBadge) {
        countBadge.textContent = `${chapters.length} ${chapters.length === 1 ? 'chapter' : 'chapters'}`;
    }

    if (!chapters || chapters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📖</div>
                <h3 class="empty-state-title">No chapters found</h3>
                <p class="empty-state-text">Write your first chapter above or adjust your search filters.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = chapters.map(ch => {
        const isFav = Boolean(ch.favorite);
        const plainText = (ch.content || '').replace(/<[^>]*>/g, ' ');
        const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
        const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

        return `
            <div class="glass-card chapter-card">
                <div class="card-top">
                    <span class="badge badge-category">${escapeHtml(ch.category || 'General')}</span>
                    <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleChapterFavorite(${ch.id})" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFav ? '★' : '☆'}
                    </button>
                </div>

                <div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.4rem; color: #ffffff;">${escapeHtml(ch.title)}</h3>
                    <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${escapeHtml(ch.description || plainText)}
                    </p>
                </div>

                <div class="card-footer-bar">
                    <div>
                        <span>${wordCount} words</span> • <span>${readMinutes} min read</span>
                    </div>
                    <div style="display: flex; gap: 0.35rem;">
                        <button class="btn btn-secondary btn-sm" onclick="openChapterReaderModal(${ch.id})">Open</button>
                        <button class="btn btn-secondary btn-sm" onclick="populateEditorForEdit(${ch.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteChapter(${ch.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// 4. READER MODAL & EDIT ACTIONS
// ==========================================

function openChapterReaderModal(id) {
    const chapter = allChapters.find(c => c.id === id);
    if (!chapter) return;

    const modal = document.getElementById('chapter-reader-modal');
    if (!modal) return;

    document.getElementById('reader-title').textContent = chapter.title;
    document.getElementById('reader-category').textContent = chapter.category || 'General';
    document.getElementById('reader-date').textContent = formatDate(chapter.createdAt);
    document.getElementById('reader-content').innerHTML = chapter.content;

    modal.classList.add('active');
}

function closeChapterReaderModal() {
    const modal = document.getElementById('chapter-reader-modal');
    if (modal) modal.classList.remove('active');
}

function populateEditorForEdit(id) {
    const chapter = allChapters.find(c => c.id === id);
    if (!chapter) return;

    currentEditingChapterId = chapter.id;
    document.getElementById('chapter-title').value = chapter.title;
    document.getElementById('chapter-category').value = chapter.category || '';
    document.getElementById('chapter-description').value = chapter.description || '';
    
    const editor = document.getElementById('chapter-editor');
    editor.innerHTML = chapter.content;
    updateMetrics();

    const saveBtn = document.getElementById('btn-save-chapter');
    if (saveBtn) saveBtn.innerHTML = `<span>Update Chapter</span>`;

    const statusEl = document.getElementById('editor-status-mode');
    if (statusEl) statusEl.textContent = `Editing: ${chapter.title}`;

    // Scroll smoothly to editor
    document.getElementById('chapter-editor-container')?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Loaded "${chapter.title}" into editor`, 'info');
}

async function toggleChapterFavorite(id) {
    try {
        const response = await apiCall(`/chapters/${id}/favorite`, 'PUT');
        if (response.success) {
            const target = allChapters.find(c => c.id === id);
            if (target) {
                target.favorite = !target.favorite;
                applyChapterFilters();
            }
            showToast(response.message || 'Favorite updated', 'info');
        }
    } catch (err) {
        showToast('Could not update favorite', 'error');
    }
}

async function deleteChapter(id) {
    if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) return;

    try {
        const response = await apiCall(`/chapters/${id}`, 'DELETE');
        if (response.success) {
            allChapters = allChapters.filter(c => c.id !== id);
            applyChapterFilters();
            showToast('Chapter deleted successfully', 'success');
        }
    } catch (err) {
        showToast('Failed to delete chapter', 'error');
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
