/**
 * Caption & Chapter Studio - Dark / Light Theme System
 * Handles theme persistence, system preference detection, smooth transitions, and toggle UI.
 */

const THEME_STORAGE_KEY = 'theme';

/**
 * Get current saved theme from localStorage, or detect device/browser preference.
 * @returns {'dark' | 'light'}
 */
function getSavedTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
        return saved;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    // Default to dark theme for premium SaaS feel
    return 'dark';
}

/**
 * Apply the specified theme ('dark' or 'light') to the document and update UI toggle controls.
 * @param {'dark' | 'light'} theme
 * @param {boolean} save
 */
function setTheme(theme, save = true) {
    const currentTheme = theme === 'light' ? 'light' : 'dark';
    
    // Apply data-theme attribute on root HTML element
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (save) {
        localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    }

    // Update all theme toggle buttons on the page
    updateToggleButtons(currentTheme);
}

/**
 * Toggle between Dark and Light mode.
 */
function toggleTheme() {
    const active = document.documentElement.getAttribute('data-theme') || getSavedTheme();
    const target = active === 'dark' ? 'light' : 'dark';
    setTheme(target, true);
}

/**
 * Synchronize UI state of all theme toggle buttons.
 * @param {'dark' | 'light'} theme
 */
function updateToggleButtons(theme) {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
        const isDark = theme === 'dark';
        btn.setAttribute('aria-pressed', isDark ? 'false' : 'true');
        btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        
        // Update label text if present
        const labelEl = btn.querySelector('.theme-toggle-label');
        if (labelEl) {
            labelEl.textContent = isDark ? 'Dark Mode' : 'Light Mode';
        }

        // Add active classes for visual styling
        if (isDark) {
            btn.classList.remove('theme-light-active');
            btn.classList.add('theme-dark-active');
        } else {
            btn.classList.remove('theme-dark-active');
            btn.classList.add('theme-light-active');
        }
    });
}

/**
 * Initialize theme on page load.
 */
function initializeTheme() {
    const initialTheme = getSavedTheme();
    setTheme(initialTheme, false);

    // Bind click events to all theme toggle buttons
    const bindButtons = () => {
        const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
        toggleBtns.forEach(btn => {
            // Avoid duplicate listeners
            if (!btn.dataset.themeBound) {
                btn.dataset.themeBound = 'true';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleTheme();
                });
            }
        });
        updateToggleButtons(document.documentElement.getAttribute('data-theme') || initialTheme);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindButtons);
    } else {
        bindButtons();
    }

    // Listen for OS system theme changes if user hasn't explicitly set localStorage
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                setTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    }
}

// Execute immediately to prevent any Flash of Unstyled Content (FOUC)
initializeTheme();

// Export globals for inline script access
window.themeSystem = {
    getSavedTheme,
    setTheme,
    toggleTheme,
    initializeTheme
};
