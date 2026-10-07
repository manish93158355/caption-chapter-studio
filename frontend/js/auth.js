/**
 * Caption & Chapter Studio - Authentication Logic (Login & Registration)
 */

document.addEventListener('DOMContentLoaded', () => {
    // If user is already logged in and navigates to login/signup, redirect to dashboard
    const token = getToken();
    const currentPage = window.location.pathname.split('/').pop();
    if (token && (currentPage === 'login.html' || currentPage === 'signup.html')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // ==========================================
    // 1. LOGIN FORM HANDLING
    // ==========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const rememberMeCheck = document.getElementById('remember-me');
        const loginBtn = document.getElementById('login-submit-btn');
        const fillDemoBtn = document.getElementById('fill-demo-btn');

        // One-Click Demo Credentials
        if (fillDemoBtn) {
            fillDemoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                emailInput.value = 'demo@captionstudio.com';
                passwordInput.value = 'Demo@1234';
                showToast('Demo credentials autofilled!', 'info');
            });
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = rememberMeCheck ? rememberMeCheck.checked : false;

            // Basic Client-Side Validation
            if (!email) {
                showToast('Please enter your email address', 'warning');
                emailInput.focus();
                return;
            }
            if (!isValidEmail(email)) {
                showToast('Please enter a valid email format', 'warning');
                emailInput.focus();
                return;
            }
            if (!password) {
                showToast('Please enter your password', 'warning');
                passwordInput.focus();
                return;
            }

            // Set Loading UI
            const originalBtnText = loginBtn.innerHTML;
            loginBtn.disabled = true;
            loginBtn.innerHTML = `<span>Signing in...</span>`;

            try {
                const response = await apiCall('/auth/login', 'POST', {
                    email,
                    password,
                    rememberMe
                }, false);

                if (response.success && response.data) {
                    const { token, user } = response.data;
                    setToken(token, rememberMe);
                    setUser(user, rememberMe);
                    showToast('Welcome back! Redirecting to dashboard...', 'success');

                    const urlParams = new URLSearchParams(window.location.search);
                    const redirect = urlParams.get('redirect') || 'dashboard.html';

                    setTimeout(() => {
                        window.location.href = redirect;
                    }, 600);
                } else {
                    showToast(response.message || 'Login failed. Please check credentials.', 'error');
                }
            } catch (err) {
                showToast(err.message || 'Login failed. Please check your credentials.', 'error');
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnText;
            }
        });
    }

    // ==========================================
    // 2. SIGNUP FORM HANDLING
    // ==========================================
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const signupBtn = document.getElementById('signup-submit-btn');

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Form Validations
            if (!name || name.length < 2) {
                showToast('Please enter your full name (at least 2 characters)', 'warning');
                nameInput.focus();
                return;
            }
            if (!email || !isValidEmail(email)) {
                showToast('Please enter a valid email address', 'warning');
                emailInput.focus();
                return;
            }
            if (!password || password.length < 6) {
                showToast('Password must be at least 6 characters long', 'warning');
                passwordInput.focus();
                return;
            }
            if (password !== confirmPassword) {
                showToast('Passwords do not match. Please verify.', 'error');
                confirmPasswordInput.focus();
                return;
            }

            // Set Loading UI
            const originalBtnText = signupBtn.innerHTML;
            signupBtn.disabled = true;
            signupBtn.innerHTML = `<span>Creating account...</span>`;

            try {
                const response = await apiCall('/auth/register', 'POST', {
                    name,
                    email,
                    password,
                    confirmPassword
                }, false);

                if (response.success && response.data) {
                    const { token, user } = response.data;
                    setToken(token, true);
                    setUser(user, true);
                    showToast('Account created successfully! Welcome to Caption & Chapter Studio.', 'success');

                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 800);
                } else {
                    showToast(response.message || 'Registration failed. Try again.', 'error');
                }
            } catch (err) {
                showToast(err.message || 'Registration error occurred. Please try again.', 'error');
            } finally {
                signupBtn.disabled = false;
                signupBtn.innerHTML = originalBtnText;
            }
        });
    }
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
