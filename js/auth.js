document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://tu-api.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Error en el login. Revisa tus credenciales.');
        }

        const data = await response.json();
        
        // Guardar el token en localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userName', data.userName);

        // Redirigir al cotizador
        window.location.href = 'index.html';

    } catch (error) {
        alert(error.message);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

function isAuthenticated() {
    return !!localStorage.getItem('authToken');
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}
