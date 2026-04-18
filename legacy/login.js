// ===================================
// Login Authentication
// ===================================

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        window.location.href = 'index.html';
    }

    initLoginForm();
});

function initLoginForm() {
    const form = document.getElementById('login-form');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        const eyeOpen = togglePassword.querySelector('.eye-open');
        const eyeClosed = togglePassword.querySelector('.eye-closed');

        if (type === 'password') {
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        } else {
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        }
    });

    // Handle form submission
    form.addEventListener('submit', handleLogin);

    // Add enter key support
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            form.dispatchEvent(new Event('submit'));
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Validate inputs
    if (!email || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="spinner">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="50" stroke-dashoffset="25"/>
        </svg>
    `;

    try {
        // Make API call to login endpoint
        // All credentials sent in body for webhook compatibility
        const response = await fetch(getApiUrl('/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                rememberMe: rememberMe
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Credenciais inválidas');
        }

        const data = await response.json();

        // Store authentication data - token and userId
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);

        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }

        if (data.userId) {
            localStorage.setItem('userId', data.userId.toString());
        }

        if (data.user) {
            localStorage.setItem('userData', JSON.stringify(data.user));
        }

        // Show success animation
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 10L9 13L14 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Sucesso!</span>
        `;

        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Login error:', error);

        // Reset button
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;

        // Show error message
        showError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
}

function showError(message) {
    const form = document.getElementById('login-form');

    // Remove existing error if any
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M10 6V10M10 14H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>${message}</span>
    `;

    // Insert error before the form
    form.parentNode.insertBefore(errorDiv, form);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Handle "Esqueceu a senha?" link
document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funcionalidade de recuperação de senha em desenvolvimento.\n\nEntre em contato com o administrador do sistema.');
        });
    }

    const signupLink = document.querySelector('.signup-link');
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funcionalidade de cadastro em desenvolvimento.\n\nEntre em contato com o administrador do sistema para criar uma conta.');
        });
    }
});
