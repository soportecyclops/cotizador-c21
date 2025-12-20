/**
 * Gestor de Autenticación para Cotizador Inmobiliario Century 21
 * Versión: 2.0
 * Descripción: Módulo para gestionar la autenticación de usuarios
 */

// Objeto global para el gestor de autenticación
window.AuthManager = {
    // Estado de autenticación
    isAuthenticated: false,
    currentUser: null,
    
    // Inicialización del gestor
    init: function() {
        console.log('Inicializando AuthManager...');
        this.setupEventListeners();
        this.checkAuthStatus();
        console.log('AuthManager inicializado correctamente');
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Listener para formulario de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Listener para formulario de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // Listener para botón de logout
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    },
    
    // Verificar estado de autenticación
    checkAuthStatus: function() {
        const token = localStorage.getItem('auth-token');
        const userData = localStorage.getItem('user-data');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.updateUIForAuthenticatedUser();
            } catch (error) {
                console.error('Error al parsear datos de usuario:', error);
                this.clearAuthData();
            }
        }
    },
    
    // Manejar login
    handleLogin: function() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Validar campos
        if (!email || !password) {
            this.showNotification('Por favor, complete todos los campos', 'error');
            return;
        }
        
        // Simular autenticación (en una app real, esto sería una llamada a la API)
        this.authenticateUser(email, password);
    },
    
    // Manejar registro
    handleRegister: function() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        // Validar campos
        if (!name || !email || !password || !confirmPassword) {
            this.showNotification('Por favor, complete todos los campos', 'error');
            return;
        }
        
        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        
        // Simular registro (en una app real, esto sería una llamada a la API)
        this.registerUser(name, email, password);
    },
    
    // Autenticar usuario
    authenticateUser: function(email, password) {
        // Simular llamada a API
        setTimeout(() => {
            // Simular respuesta exitosa
            const userData = {
                id: 1,
                name: 'Usuario de Prueba',
                email: email,
                role: 'asesor'
            };
            
            const token = 'fake-jwt-token-' + Date.now();
            
            // Guardar datos de autenticación
            localStorage.setItem('auth-token', token);
            localStorage.setItem('user-data', JSON.stringify(userData));
            
            // Actualizar estado
            this.currentUser = userData;
            this.isAuthenticated = true;
            
            // Actualizar UI
            this.updateUIForAuthenticatedUser();
            
            // Redirigir a la página principal
            window.location.href = 'index.html';
            
        }, 1000);
    },
    
    // Registrar usuario
    registerUser: function(name, email, password) {
        // Simular llamada a API
        setTimeout(() => {
            // Simular respuesta exitosa
            const userData = {
                id: 2,
                name: name,
                email: email,
                role: 'asesor'
            };
            
            const token = 'fake-jwt-token-' + Date.now();
            
            // Guardar datos de autenticación
            localStorage.setItem('auth-token', token);
            localStorage.setItem('user-data', JSON.stringify(userData));
            
            // Actualizar estado
            this.currentUser = userData;
            this.isAuthenticated = true;
            
            // Actualizar UI
            this.updateUIForAuthenticatedUser();
            
            // Redirigir a la página principal
            window.location.href = 'index.html';
            
        }, 1000);
    },
    
    // Cerrar sesión
    logout: function() {
        // Limpiar datos de autenticación
        this.clearAuthData();
        
        // Actualizar estado
        this.isAuthenticated = false;
        this.currentUser = null;
        
        // Actualizar UI
        this.updateUIForUnauthenticatedUser();
        
        // Redirigir a la página de login
        window.location.href = 'login.html';
    },
    
    // Limpiar datos de autenticación
    clearAuthData: function() {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
    },
    
    // Actualizar UI para usuario autenticado
    updateUIForAuthenticatedUser: function() {
        // Actualizar nombre de usuario
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.name;
        }
        
        // Mostrar elementos para usuarios autenticados
        const authElements = document.querySelectorAll('.auth-only');
        authElements.forEach(element => {
            element.style.display = 'block';
        });
        
        // Ocultar elementos para usuarios no autenticados
        const unauthElements = document.querySelectorAll('.unauth-only');
        unauthElements.forEach(element => {
            element.style.display = 'none';
        });
    },
    
    // Actualizar UI para usuario no autenticado
    updateUIForUnauthenticatedUser: function() {
        // Ocultar elementos para usuarios autenticados
        const authElements = document.querySelectorAll('.auth-only');
        authElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Mostrar elementos para usuarios no autenticados
        const unauthElements = document.querySelectorAll('.unauth-only');
        unauthElements.forEach(element => {
            element.style.display = 'block';
        });
    },
    
    // Mostrar notificación
    showNotification: function(message, type = 'info') {
        // Usar el sistema de notificaciones de CotizadorApp si está disponible
        if (window.CotizadorApp && window.CotizadorApp.showNotification) {
            window.CotizadorApp.showNotification(message, type);
        } else {
            // Fallback a alert
            alert(message);
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que se inicialice CotizadorApp
    setTimeout(() => {
        if (window.AuthManager) {
            window.AuthManager.init();
        }
    }, 500);
});
