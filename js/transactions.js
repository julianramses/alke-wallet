$(document).ready(function() {
    // Verificar si el usuario está logueado
    if (!sessionStorage.getItem('userLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Obtener transacciones
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    let filteredTransactions = [...transactions];

    // Cargar transacciones
    loadTransactions(filteredTransactions);
    updateSummary(filteredTransactions);

    // Filtro por tipo
    $('#filterType').on('change', function() {
        applyFilters();
    });

    // Filtro por fecha
    $('#filterDate').on('change', function() {
        applyFilters();
    });

    // Búsqueda
    $('#searchTransaction').on('input', function() {
        applyFilters();
    });

    
    // Función para aplicar filtros
    function applyFilters() {
        const type = $('#filterType').val();
        const dateFilter = $('#filterDate').val();
        const searchTerm = $('#searchTransaction').val().toLowerCase();

        filteredTransactions = transactions.filter(transaction => {
            // Filtro por tipo
            if (type !== 'all' && transaction.type !== type) {
                return false;
            }

            // Filtro por fecha
            if (dateFilter !== 'all') {
                const transactionDate = new Date(transaction.date);
                const now = new Date();
                
                if (dateFilter === 'today') {
                    if (transactionDate.toDateString() !== now.toDateString()) {
                        return false;
                    }
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                    if (transactionDate < weekAgo) {
                        return false;
                    }
                } else if (dateFilter === 'month') {
                    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
                    if (transactionDate < monthAgo) {
                        return false;
                    }
                }
            }

            // Filtro por búsqueda
            if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm)) {
                return false;
            }

            return true;
        });

        loadTransactions(filteredTransactions);
        updateSummary(filteredTransactions);
    }

    // Función para cargar transacciones
    function loadTransactions(transactionList) {
        const container = $('#transactionsList');
        const emptyState = $('#emptyState');
        
        container.empty();

        if (transactionList.length === 0) {
            container.closest('.card').hide();
            emptyState.removeClass('d-none');
            return;
        }

        container.closest('.card').show();
        emptyState.addClass('d-none');

        // Ordenar por fecha (más reciente primero)
        transactionList.sort((a, b) => new Date(b.date) - new Date(a.date));

        transactionList.forEach(function(transaction, index) {
            const isIncome = transaction.type === 'deposit' || transaction.type === 'receive';
            const icon = getTransactionIcon(transaction.type);
            const color = isIncome ? 'success' : 'danger';
            const sign = isIncome ? '+' : '-';
            const typeName = getTypeName(transaction.type);

            const row = $(`
                <tr class="transaction-row" data-index="${index}">
                    <td>${formatDate(transaction.date)}</td>
                    <td>
                        <span class="badge bg-${color}-soft text-${color}">
                            <i class="fas ${icon} me-1"></i>${typeName}
                        </span>
                    </td>
                    <td>${transaction.description}</td>
                    <td class="text-end">
                        <strong class="text-${color}">${sign}$${formatNumber(transaction.amount)}</strong>
                    </td>
                    <td class="text-center">
                        <span class="badge bg-success">Completada</span>
                    </td>
                </tr>
            `);

            row.on('click', function() {
                showTransactionDetail(transaction);
            });

            container.append(row);
        });

        // Animación de entrada
        $('.transaction-row').hide().each(function(index) {
            $(this).delay(index * 50).fadeIn(300);
        });
    }

    // Función para actualizar resumen
    function updateSummary(transactionList) {
        let totalIncome = 0;
        let totalExpense = 0;

        transactionList.forEach(function(transaction) {
            if (transaction.type === 'deposit' || transaction.type === 'receive') {
                totalIncome += transaction.amount;
            } else if (transaction.type === 'transfer') {
                totalExpense += transaction.amount;
            }
        });

        $('#totalIncome').text(formatNumber(totalIncome));
        $('#totalExpense').text(formatNumber(totalExpense));
        $('#totalTransactions').text(transactionList.length);

        // Animación de contador
        animateValue('totalIncome', 0, totalIncome, 800);
        animateValue('totalExpense', 0, totalExpense, 800);
        animateValue('totalTransactions', 0, transactionList.length, 600);
    }

    // Función para mostrar detalle de transacción
    function showTransactionDetail(transaction) {
        const isIncome = transaction.type === 'deposit' || transaction.type === 'receive';
        const icon = getTransactionIcon(transaction.type);
        const color = isIncome ? 'success' : 'danger';
        const sign = isIncome ? '+' : '-';

        $('#modalIcon').html(`<i class="fas ${icon} text-${color}"></i>`)
            .removeClass().addClass(`transaction-icon bg-${color}-soft`);
        $('#modalAmount').text(`${sign}$${formatNumber(transaction.amount)}`)
            .removeClass().addClass(`text-${color}`);
        $('#modalType').text(getTypeName(transaction.type));
        $('#modalDescription').text(transaction.description);
        $('#modalDate').text(formatFullDate(transaction.date));

        if (transaction.note) {
            $('#modalNote').text(transaction.note);
            $('#modalNoteRow').show();
        } else {
            $('#modalNoteRow').hide();
        }

        const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
        modal.show();
    }

    // Función para obtener el icono según el tipo
    function getTransactionIcon(type) {
        const icons = {
            'deposit': 'fa-plus-circle',
            'transfer': 'fa-paper-plane',
            'receive': 'fa-arrow-down'
        };
        return icons[type] || 'fa-exchange-alt';
    }

    // Función para obtener el nombre del tipo
    function getTypeName(type) {
        const names = {
            'deposit': 'Depósito',
            'transfer': 'Transferencia',
            'receive': 'Recibido'
        };
        return names[type] || type;
    }

    // Función para formatear fecha
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Función para formatear fecha completa
    function formatFullDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Función para formatear números
    function formatNumber(num) {
        return num.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    // Función para animar valores
    function animateValue(id, start, end, duration) {
        const element = document.getElementById(id);
        if (!element) return;

        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(function() {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            
            if (id === 'totalTransactions') {
                element.textContent = Math.floor(current);
            } else {
                element.textContent = formatNumber(Math.floor(current));
            }
        }, 16);
    }


    // Función para mostrar notificaciones
    function showNotification(message, type) {
        const notification = $(`
            <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" role="alert" style="z-index: 9999;">
                <i class="fas fa-check-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        $('body').append(notification);
        setTimeout(() => notification.fadeOut(function() { $(this).remove(); }), 3000);
    }

    // Animación de entrada
    $('.card, .row > div').hide().each(function(index) {
        $(this).delay(index * 100).fadeIn(600);
    });
});