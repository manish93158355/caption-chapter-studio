/**
 * Caption & Chapter Studio - Topic-Aware Caption Generator & Library Controller
 */

let allCaptions = [];
let currentGenerationState = {
    topic: '',
    platform: 'Instagram',
    tone: 'Professional',
    length: 'Medium',
    includeHashtags: true,
    seed: 0,
    captions: []
};

document.addEventListener('DOMContentLoaded', async () => {
    // If not authenticated, redirect to login
    if (!requireAuth()) return;

    setupGeneratorForm();
    setupFiltersAndSearch();
    await loadCaptions();
});

// ==========================================
// 1. CAPTION GENERATOR CONTROLS
// ==========================================

function setupGeneratorForm() {
    const generateBtn = document.getElementById('btn-generate-caption');
    const clearBtn = document.getElementById('btn-clear-generator');
    const generateMoreBtn = document.getElementById('btn-generate-more');
    const lengthButtons = document.querySelectorAll('.segment-btn');
    const platformRadios = document.querySelectorAll('.platform-radio-label input');

    // Platform chip radio selector styling
    platformRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.platform-radio-label').forEach(lbl => lbl.classList.remove('selected'));
            radio.closest('.platform-radio-label').classList.add('selected');
        });
    });

    // Length segmented buttons
    lengthButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            lengthButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Clear Generator
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('caption-topic').value = '';
            document.getElementById('caption-options-list').innerHTML = '';
            document.getElementById('result-initial-placeholder').style.display = 'block';
            document.getElementById('results-loading').style.display = 'none';
            document.getElementById('generate-more-wrapper').style.display = 'none';
            const countBadge = document.getElementById('results-count-badge');
            if (countBadge) countBadge.style.display = 'none';
            document.getElementById('generation-topic-badge').textContent = 'Ready to synthesize';
            currentGenerationState.captions = [];
        });
    }

    // Generate 5 Captions Action
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            await triggerGeneration(false);
        });
    }

    // Generate More Action
    if (generateMoreBtn) {
        generateMoreBtn.addEventListener('click', async () => {
            currentGenerationState.seed += 5;
            await triggerGeneration(true);
        });
    }
}

async function triggerGeneration(isMore = false) {
    const topicInput = document.getElementById('caption-topic');
    const topic = topicInput.value.trim();

    if (!topic) {
        showToast('Please enter a specific topic or concept', 'warning');
        topicInput.focus();
        return;
    }

    const platformRadio = document.querySelector('input[name="platform"]:checked');
    const platform = platformRadio ? platformRadio.value : 'Instagram';
    const toneSelect = document.getElementById('caption-tone');
    const tone = toneSelect ? toneSelect.value : 'Professional';
    const activeLengthBtn = document.querySelector('.segment-btn.active');
    const length = activeLengthBtn ? activeLengthBtn.getAttribute('data-value') : 'Medium';
    const hashtagsCheck = document.getElementById('include-hashtags');
    const includeHashtags = hashtagsCheck ? hashtagsCheck.checked : true;

    currentGenerationState.topic = topic;
    currentGenerationState.platform = platform;
    currentGenerationState.tone = tone;
    currentGenerationState.length = length;
    currentGenerationState.includeHashtags = includeHashtags;
    if (!isMore) {
        currentGenerationState.seed = Math.floor(Math.random() * 50);
    }

    const generateBtn = document.getElementById('btn-generate-caption');
    const generateMoreBtn = document.getElementById('btn-generate-more');
    const placeholder = document.getElementById('result-initial-placeholder');
    const loading = document.getElementById('results-loading');
    const optionsContainer = document.getElementById('caption-options-list');
    const generateMoreWrapper = document.getElementById('generate-more-wrapper');
    const topicBadge = document.getElementById('generation-topic-badge');
    const countBadge = document.getElementById('results-count-badge');

    // UI Loading state
    if (placeholder) placeholder.style.display = 'none';
    if (optionsContainer) optionsContainer.style.display = 'none';
    if (loading) loading.style.display = 'flex';
    if (generateMoreWrapper) generateMoreWrapper.style.display = 'none';

    if (isMore && generateMoreBtn) {
        generateMoreBtn.disabled = true;
        generateMoreBtn.innerHTML = `<span>Synthesizing 5 new options...</span>`;
    } else if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span>Synthesizing 5 Options...</span>`;
    }

    try {
        const response = await apiCall('/captions/generate', 'POST', {
            topic: currentGenerationState.topic,
            platform: currentGenerationState.platform,
            tone: currentGenerationState.tone,
            length: currentGenerationState.length,
            hashtagEnabled: currentGenerationState.includeHashtags,
            includeHashtags: currentGenerationState.includeHashtags,
            seed: currentGenerationState.seed
        }, false);

        // Standardize list from response
        let receivedCaptions = [];
        if (response.captions && Array.isArray(response.captions)) {
            receivedCaptions = response.captions;
        } else if (response.data && response.data.captions && Array.isArray(response.data.captions)) {
            receivedCaptions = response.data.captions;
        } else if (response.data && response.data.primaryCaption) {
            receivedCaptions = [
                { content: response.data.primaryCaption, hashtags: response.data.hashtags || [] },
                { content: response.data.alternativeCaption || response.data.primaryCaption, hashtags: response.data.hashtags || [] }
            ];
        }

        currentGenerationState.captions = receivedCaptions;

        if (topicBadge) topicBadge.textContent = `Topic: "${escapeHtml(topic)}"`;
        if (countBadge) {
            countBadge.style.display = 'inline-flex';
            countBadge.textContent = `${receivedCaptions.length} Options`;
        }

        renderCaptionOptionCards(receivedCaptions);
        showToast(isMore ? 'Generated 5 fresh caption options!' : '5 topic-specific captions generated!', 'success');

    } catch (err) {
        console.error('Generation error:', err);
        showToast(err.message || 'Error generating captions', 'error');
        if (placeholder) placeholder.style.display = 'block';
    } finally {
        if (loading) loading.style.display = 'none';
        if (optionsContainer) optionsContainer.style.display = 'flex';
        if (generateMoreWrapper) generateMoreWrapper.style.display = 'block';

        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<span>⚡ Generate 5 Captions</span>`;
        }
        if (generateMoreBtn) {
            generateMoreBtn.disabled = false;
            generateMoreBtn.innerHTML = `<span>✨ Generate More (5 New Unique Captions)</span>`;
        }
    }
}

function renderCaptionOptionCards(captionsList) {
    const container = document.getElementById('caption-options-list');
    if (!container) return;

    if (!captionsList || captionsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 2rem;">
                <p>No captions generated. Please try again.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = captionsList.map((item, index) => {
        const optionNum = index + 1;
        const text = item.content || '';
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const chars = text.length;
        const hashtags = item.hashtags || [];

        return `
            <div class="caption-option-card" id="caption-card-${optionNum}">
                <div class="option-card-header">
                    <div class="option-number-badge">
                        <span style="font-size: 1.1rem;">🏷️</span>
                        <span>Caption ${optionNum}</span>
                        <span class="badge badge-platform-${currentGenerationState.platform.toLowerCase().replace('/', '')}">${currentGenerationState.platform}</span>
                        <span class="badge badge-tone">${currentGenerationState.tone}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">
                        <span>${words} words</span> • <span>${chars} chars</span>
                    </div>
                </div>

                <div class="option-card-text" id="caption-text-${optionNum}">${escapeHtml(text)}</div>

                ${hashtags.length > 0 ? `
                    <div class="hashtags-container" style="margin-bottom: 0.75rem;">
                        ${hashtags.map(t => `<span class="hashtag-pill" onclick="copyToClipboard('${escapeAttr(t)}', 'Hashtag copied!')" title="Click to copy">${escapeHtml(t)}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="option-card-actions">
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Option ${optionNum} of 5</div>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="copySingleCard(${optionNum})">
                            📋 Copy
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" id="btn-save-${optionNum}" onclick="saveSingleCard(${optionNum}, false)">
                            💾 Save
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-fav-${optionNum}" onclick="saveSingleCard(${optionNum}, true)" title="Favorite & Save">
                            ⭐ Favorite
                        </button>
                        <button type="button" class="btn btn-ghost btn-sm" onclick="regenerateSingleCard(${optionNum})" title="Re-roll this single caption">
                            🔄 Regenerate
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Single Card Actions
function copySingleCard(index) {
    const textEl = document.getElementById(`caption-text-${index}`);
    if (textEl) {
        copyToClipboard(textEl.innerText, `Caption ${index} copied to clipboard!`);
    }
}

async function saveSingleCard(index, markFavorite = false) {
    const textEl = document.getElementById(`caption-text-${index}`);
    if (!textEl) return;

    const content = textEl.innerText.trim();
    const btn = document.getElementById(markFavorite ? `btn-fav-${index}` : `btn-save-${index}`);
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Saving...</span>`;
    }

    try {
        const response = await apiCall('/captions', 'POST', {
            topic: currentGenerationState.topic,
            platform: currentGenerationState.platform,
            tone: currentGenerationState.tone,
            content: content,
            favorite: markFavorite
        });

        if (response.success) {
            showToast(markFavorite ? `Caption ${index} saved to Favorites!` : `Caption ${index} saved to Library!`, 'success');
            if (btn) btn.innerHTML = markFavorite ? `★ Favorited` : `✓ Saved`;
            await loadCaptions(); // Refresh library list below
        }
    } catch (err) {
        showToast(err.message || 'Error saving caption', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

async function regenerateSingleCard(index) {
    const card = document.getElementById(`caption-card-${index}`);
    if (!card) return;

    const originalHtml = card.innerHTML;
    card.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
            <span>🔄 Regenerating Caption ${index}...</span>
        </div>
    `;

    try {
        const singleSeed = Math.floor(Math.random() * 200) + index * 13;
        const response = await apiCall('/captions/generate', 'POST', {
            topic: currentGenerationState.topic,
            platform: currentGenerationState.platform,
            tone: currentGenerationState.tone,
            length: currentGenerationState.length,
            hashtagEnabled: currentGenerationState.includeHashtags,
            seed: singleSeed
        }, false);

        let freshCaptions = response.captions || (response.data && response.data.captions) || [];
        if (freshCaptions.length > 0) {
            const picked = freshCaptions[(index - 1) % freshCaptions.length];
            currentGenerationState.captions[index - 1] = picked;
            renderCaptionOptionCards(currentGenerationState.captions);
            showToast(`Regenerated Caption ${index}!`, 'info');
        } else {
            card.innerHTML = originalHtml;
        }
    } catch (err) {
        card.innerHTML = originalHtml;
        showToast('Could not regenerate this caption', 'error');
    }
}

// ==========================================
// 2. CAPTIONS LIBRARY & SEARCH / FILTER
// ==========================================

async function loadCaptions() {
    const listContainer = document.getElementById('captions-list');
    if (!listContainer) return;

    try {
        const response = await apiCall('/captions', 'GET');
        if (response.success && response.data) {
            allCaptions = response.data;
            applyFilters();
        }
    } catch (err) {
        console.error('Error loading captions:', err);
        showToast('Failed to load captions library', 'error');
    }
}

function setupFiltersAndSearch() {
    const searchInput = document.getElementById('search-captions');
    const platformFilter = document.getElementById('filter-platform');
    const favOnlyFilter = document.getElementById('filter-fav-only');

    if (searchInput) {
        searchInput.addEventListener('input', () => applyFilters());
    }
    if (platformFilter) {
        platformFilter.addEventListener('change', () => applyFilters());
    }
    if (favOnlyFilter) {
        favOnlyFilter.addEventListener('change', () => applyFilters());
    }
}

function applyFilters() {
    const searchVal = (document.getElementById('search-captions')?.value || '').toLowerCase().trim();
    const platformVal = document.getElementById('filter-platform')?.value || 'all';
    const favOnly = document.getElementById('filter-fav-only')?.checked || false;

    const filtered = allCaptions.filter(c => {
        const matchesSearch = !searchVal || 
            (c.topic && c.topic.toLowerCase().includes(searchVal)) || 
            (c.content && c.content.toLowerCase().includes(searchVal));

        const matchesPlatform = platformVal === 'all' || 
            (c.platform && c.platform.toLowerCase() === platformVal.toLowerCase());

        const matchesFav = !favOnly || Boolean(c.favorite);

        return matchesSearch && matchesPlatform && matchesFav;
    });

    renderCaptionsGrid(filtered);
}

function renderCaptionsGrid(captions) {
    const container = document.getElementById('captions-list');
    const countBadge = document.getElementById('caption-count-badge');
    if (!container) return;

    if (countBadge) {
        countBadge.textContent = `${captions.length} ${captions.length === 1 ? 'caption' : 'captions'}`;
    }

    if (!captions || captions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3 class="empty-state-title">No captions found</h3>
                <p class="empty-state-text">Generate new captions above or adjust your search filter to see your library.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = captions.map(c => {
        const platformClass = (c.platform || 'instagram').toLowerCase().replace('/', '');
        const isFav = Boolean(c.favorite);
        return `
            <div class="glass-card caption-card">
                <div class="card-top">
                    <div class="card-badges">
                        <span class="badge badge-platform-${platformClass}">${c.platform}</span>
                        <span class="badge badge-tone">${c.tone}</span>
                    </div>
                    <div class="card-actions-quick">
                        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleCaptionFavorite(${c.id})" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                            ${isFav ? '★' : '☆'}
                        </button>
                    </div>
                </div>

                <h4 style="font-size: 1rem; margin-bottom: 0.5rem; color: #ffffff;">${escapeHtml(c.topic)}</h4>
                <div class="card-content-text">${escapeHtml(c.content)}</div>

                <div class="card-footer-bar">
                    <span>${formatDate(c.createdAt)}</span>
                    <div style="display: flex; gap: 0.35rem;">
                        <button class="btn btn-secondary btn-sm" onclick="copyToClipboard(\`${escapeAttr(c.content)}\`)">Copy</button>
                        <button class="btn btn-secondary btn-sm" onclick="openEditCaptionModal(${c.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCaption(${c.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// 3. EDIT, DELETE & FAVORITE ACTIONS
// ==========================================

async function toggleCaptionFavorite(id) {
    try {
        const response = await apiCall(`/captions/${id}/favorite`, 'PUT');
        if (response.success) {
            const target = allCaptions.find(c => c.id === id);
            if (target) {
                target.favorite = !target.favorite;
                applyFilters();
            }
            showToast(response.message || 'Favorite updated', 'info');
        }
    } catch (err) {
        showToast('Could not update favorite', 'error');
    }
}

async function deleteCaption(id) {
    if (!confirm('Are you sure you want to delete this caption?')) return;

    try {
        const response = await apiCall(`/captions/${id}`, 'DELETE');
        if (response.success) {
            allCaptions = allCaptions.filter(c => c.id !== id);
            applyFilters();
            showToast('Caption deleted successfully', 'success');
        }
    } catch (err) {
        showToast('Failed to delete caption', 'error');
    }
}

function openEditCaptionModal(id) {
    const caption = allCaptions.find(c => c.id === id);
    if (!caption) return;

    const modalBackdrop = document.getElementById('edit-caption-modal');
    if (!modalBackdrop) return;

    document.getElementById('edit-caption-id').value = caption.id;
    document.getElementById('edit-caption-topic').value = caption.topic;
    document.getElementById('edit-caption-platform').value = caption.platform;
    document.getElementById('edit-caption-tone').value = caption.tone;
    document.getElementById('edit-caption-content').value = caption.content;

    modalBackdrop.classList.add('active');
}

function closeEditCaptionModal() {
    const modalBackdrop = document.getElementById('edit-caption-modal');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
}

// Form submit for edit modal
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-caption-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-caption-id').value;
            const topic = document.getElementById('edit-caption-topic').value.trim();
            const platform = document.getElementById('edit-caption-platform').value;
            const tone = document.getElementById('edit-caption-tone').value;
            const content = document.getElementById('edit-caption-content').value.trim();

            try {
                const response = await apiCall(`/captions/${id}`, 'PUT', {
                    topic,
                    platform,
                    tone,
                    content
                });

                if (response.success) {
                    showToast('Caption updated successfully', 'success');
                    closeEditCaptionModal();
                    await loadCaptions();
                }
            } catch (err) {
                showToast(err.message || 'Failed to update caption', 'error');
            }
        });
    }
});

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
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
