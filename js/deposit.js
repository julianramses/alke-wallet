$(document).ready(function() {
    // Verificar si el usuario está logueado
    if (!sessionStorage.getItem('userLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Obtener el balance actual
    let currentBalance = parseFloat(localStorage.getItem('balance') || '50000');
    
    // Actualizar el balance en la interfaz
    updateBalance();

    // Manejar los botones de monto rápido
    $('.quick-amount').on('click', function() {
        const amount = $(this).data('amount');
        $('#depositAmount').val(amount);
        calculateNewBalance();
        
        // Animación del botón
        $(this).addClass('active');
        setTimeout(() => {
            $(this).removeClass('active');
        }, 200);
    });

    // Calcular nuevo balance cuando cambia el monto
    $('#depositAmount').on('input', function() {
        calculateNewBalance();
    });

    // Envío del formulario
    $('#depositForm').on('submit', function(e) {
        e.preventDefault();
        
        const amount = parseFloat($('#depositAmount').val());
        const method = $('#depositMethod').val();
        const note = $('#depositNote').val();
        
        // Validaciones
        if (!amount || amount <= 0) {
            alert('Por favor, ingresa un monto válido');
            return;
        }
        
        if (!method) {
            alert('Por favor, selecciona un método de depósito');
            return;
        }

        // Deshabilitar el botón
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<span class="loading"></span> Procesando...');

        // Simular procesamiento
        setTimeout(function() {
            // Actualizar balance
            currentBalance += amount;
            localStorage.setItem('balance', currentBalance);
            
            // Guardar transacción
            saveTransaction({
                type: 'deposit',
                amount: amount,
                description: 'Depósito - ' + getMethodName(method),
                date: new Date().toISOString(),
                status: 'completed',
                note: note || ''
            });
            
            // Mostrar modal de éxito
            $('#depositedAmount').text(formatNumber(amount));
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
            
            // Reset form
            $('#depositForm')[0].reset();
            calculateNewBalance();
            submitBtn.prop('disabled', false).html(originalText);
            
        }, 1500);
    });

    // Función para actualizar el balance
    function updateBalance() {
        $('#currentBalance').text(formatNumber(currentBalance));
    }

    // Función para calcular el nuevo balance
    function calculateNewBalance() {
        const depositAmount = parseFloat($('#depositAmount').val()) || 0;
        const newBalance = currentBalance + depositAmount;
        $('#newBalance').text(formatNumber(newBalance));
    }

    // Función para formatear números
    function formatNumber(num) {
        return num.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    // Función para guardar transacciones
    function saveTransaction(transaction) {
        let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // Función para obtener el nombre del método
    function getMethodName(method) {
        const methods = {
            'transfer': 'Transferencia Bancaria',
            'card': 'Tarjeta',
            'cash': 'Efectivo'
        };
        return methods[method] || method;
    }

    // Animación de entrada
    $('.card').hide().fadeIn(600);

    // Agregar clase active a botones
    const activeStyle = document.createElement('style');
    activeStyle.textContent = `
        .quick-amount.active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(activeStyle);
});