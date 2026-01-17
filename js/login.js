$(document).ready(function() {
    // Credenciales de prueba
    const validCredentials = {
        email: 'demo@prueba.com',
        password: 'demo123'
    };

    // Toggle password visibility
    $('#togglePassword').on('click', function() {
        const passwordInput = $('#password');
        const icon = $(this).find('i');
        
        if (passwordInput.attr('type') === 'password') {
            passwordInput.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordInput.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

    // Animación de entrada para el formulario
    $('.login-card').hide().fadeIn(800);

    // Validación del formulario
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('#email').val().trim();
        const password = $('#password').val();
        const errorMessage = $('#errorMessage');
        const errorText = $('#errorText');
        const submitBtn = $(this).find('button[type="submit"]');

        // Limpiar mensajes de error previos
        errorMessage.addClass('d-none');

        // Validar campos vacíos
        if (!email || !password) {
            showError('Por favor, completa todos los campos');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Por favor, ingresa un email válido');
            return;
        }

        // Mostrar loading en el botón
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<span class="loading"></span> Verificando...');

        // Simular validación con delay (como si fuera una API)
        setTimeout(function() {
            if (email === validCredentials.email && password === validCredentials.password) {
                // Login exitoso
                submitBtn.html('<i class="fas fa-check me-2"></i>¡Acceso concedido!').removeClass('btn-primary').addClass('btn-success');
                
                // Guardar sesión
                sessionStorage.setItem('userLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                
                // Animación de salida y redirección
                $('.login-card').fadeOut(400, function() {
                    window.location.href = 'menu.html';
                });
            } else {
                // Login fallido
                showError('Email o contraseña incorrectos');
                submitBtn.prop('disabled', false).html(originalText);
                
                // Shake animation en el formulario
                $('.login-card').addClass('shake');
                setTimeout(function() {
                    $('.login-card').removeClass('shake');
                }, 500);
            }
        }, 1500);
    });

    // Función para mostrar errores
    function showError(message) {
        const errorMessage = $('#errorMessage');
        const errorText = $('#errorText');
        
        errorText.text(message);
        errorMessage.removeClass('d-none').hide().fadeIn(300);
    }

    // Animación shake para errores
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .shake {
            animation: shake 0.5s;
        }
    `;
    document.head.appendChild(style);

    // Auto-fill demo credentials on double click
    $('.login-card').on('dblclick', function() {
        $('#email').val(validCredentials.email);
        $('#password').val(validCredentials.password);
    });
});