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

    // Cargar transacciones recientes
    loadRecentTransactions();

    // Animación de entrada para las cards
    $('.balance-card, .action-card').hide().each(function(index) {
        $(this).delay(index * 100).fadeIn(600);
    });

    // Logout
    $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('userLoggedIn');
        sessionStorage.removeItem('userEmail');
        
        // Fade out y redirección
        $('body').fadeOut(300, function() {
            window.location.href = 'login.html';
        });
    });

    // Función para actualizar el balance
    function updateBalance() {
        $('#currentBalance').text(formatNumber(currentBalance));
        localStorage.setItem('balance', currentBalance);
    }

    // Función para formatear números
    function formatNumber(num) {
        return num.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    // Función para cargar transacciones recientes
    function loadRecentTransactions() {
        let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Ordenar por fecha (más reciente primero)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Tomar solo las últimas 5
        const recentTransactions = transactions.slice(0, 5);
        
        const container = $('#recentTransactions');
        container.empty();
        
        if (recentTransactions.length === 0) {
            container.append(`
                <tr>
                    <td colspan="4" class="text-center py-4 text-muted">
                        <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                        No hay transacciones recientes
                    </td>
                </tr>
            `);
            return;
        }
        
        recentTransactions.forEach(function(transaction) {
            const isIncome = transaction.type === 'deposit' || transaction.type === 'receive';
            const icon = getTransactionIcon(transaction.type);
            const color = isIncome ? 'success' : 'danger';
            const sign = isIncome ? '+' : '-';
            
            const row = `
                <tr class="transaction-row">
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="transaction-icon bg-${color}-soft me-3">
                                <i class="fas ${icon} text-${color}"></i>
                            </div>
                            <div>
                                <strong>${transaction.description}</strong>
                                <br>
                                <small class="text-muted">${formatDate(transaction.date)}</small>
                            </div>
                        </div>
                    </td>
                    <td class="text-end">
                        <strong class="text-${color}">${sign}$${formatNumber(transaction.amount)}</strong>
                    </td>
                </tr>
            `;
            container.append(row);
        });

        // Animación para las filas
        $('.transaction-row').hide().each(function(index) {
            $(this).delay(index * 100).fadeIn(400);
        });
    }

    // Función para obtener el icono según el tipo de transacción
    function getTransactionIcon(type) {
        const icons = {
            'deposit': 'fa-plus-circle',
            'transfer': 'fa-paper-plane',
            'receive': 'fa-arrow-down'
        };
        return icons[type] || 'fa-exchange-alt';
    }

    // Función para formatear fecha
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Hoy ' + date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ayer ' + date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return diffDays + ' días atrás';
        } else {
            return date.toLocaleDateString('es-CL');
        }
    }

    // Actualizar la fecha de última actualización
    const now = new Date();
    $('#lastUpdate').text(now.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit' 
    }));

    // Hover effect en las action cards
    $('.action-card').hover(
        function() {
            $(this).find('.action-icon').addClass('pulse');
        },
        function() {
            $(this).find('.action-icon').removeClass('pulse');
        }
    );

    // Agregar animación pulse
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .pulse {
            animation: pulse 0.6s ease-in-out;
        }
    `;
    document.head.appendChild(pulseStyle);
});