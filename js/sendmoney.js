$(document).ready(function() {
    // Verificar si el usuario está logueado
    if (!sessionStorage.getItem('userLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Obtener el balance actual
    let currentBalance = parseFloat(localStorage.getItem('balance') || '50000');
    updateBalance();

    // Contactos predefinidos
    let contacts = JSON.parse(localStorage.getItem('contacts') || JSON.stringify([
        { id: 1, name: 'María González', email: 'maria@example.com', phone: '+56 9 1234 5678' },
        { id: 2, name: 'Juan Pérez', email: 'juan@example.com', phone: '+56 9 8765 4321' },
        { id: 3, name: 'Ana Martínez', email: 'ana@example.com', phone: '+56 9 5555 5555' },
        { id: 4, name: 'Carlos Silva', email: 'carlos@example.com', phone: '+56 9 7777 7777' }
    ]));

    // Guardar contactos iniciales
    localStorage.setItem('contacts', JSON.stringify(contacts));

    // Cargar contactos
    loadContacts(contacts);

    // Autocompletar con jQuery UI
    const contactNames = contacts.map(c => c.name);
    $('#contactSearch').autocomplete({
        source: contactNames,
        select: function(event, ui) {
            const contact = contacts.find(c => c.name === ui.item.value);
            if (contact) {
                selectContact(contact);
            }
        }
    });

    // Filtrar contactos en tiempo real
    $('#contactSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        const filteredContacts = contacts.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.email.toLowerCase().includes(searchTerm)
        );
        loadContacts(filteredContacts);
    });

    // Manejar botones de monto rápido
    $('.quick-amount').on('click', function() {
        const amount = $(this).data('amount');
        $('#sendAmount').val(amount);
        checkBalance();
    });

    // Verificar balance cuando cambia el monto
    $('#sendAmount').on('input', function() {
        checkBalance();
    });

    // Agregar nuevo contacto
    $('#saveContactBtn').on('click', function() {
        const name = $('#newContactName').val().trim();
        const email = $('#newContactEmail').val().trim();
        const phone = $('#newContactPhone').val().trim();

        if (!name || !email) {
            alert('Por favor, completa todos los campos obligatorios');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingresa un email válido');
            return;
        }

        // Crear nuevo contacto
        const newContact = {
            id: contacts.length + 1,
            name: name,
            email: email,
            phone: phone
        };

        contacts.push(newContact);
        localStorage.setItem('contacts', JSON.stringify(contacts));

        // Recargar contactos
        loadContacts(contacts);

        // Limpiar formulario y cerrar modal
        $('#addContactForm')[0].reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addContactModal'));
        modal.hide();

        // Mostrar mensaje de éxito
        showNotification('Contacto agregado exitosamente', 'success');
    });

    // Enviar dinero
    $('#sendMoneyForm').on('submit', function(e) {
        e.preventDefault();

        const contactId = $('#selectedContactId').val();
        const amount = parseFloat($('#sendAmount').val());
        const note = $('#sendNote').val();

        // Validaciones
        if (!contactId) {
            alert('Por favor, selecciona un contacto');
            return;
        }

        if (!amount || amount <= 0) {
            alert('Por favor, ingresa un monto válido');
            return;
        }

        if (amount > currentBalance) {
            alert('Saldo insuficiente');
            return;
        }

        // Deshabilitar botón
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<span class="loading"></span> Enviando...');

        // Simular envío
        setTimeout(function() {
            // Actualizar balance
            currentBalance -= amount;
            localStorage.setItem('balance', currentBalance);

            // Obtener contacto
            const contact = contacts.find(c => c.id == contactId);

            // Guardar transacción
            saveTransaction({
                type: 'transfer',
                amount: amount,
                description: 'Transferencia a ' + contact.name,
                date: new Date().toISOString(),
                status: 'completed',
                note: note || '',
                recipient: contact.name
            });

            // Mostrar modal de éxito
            $('#sentAmount').text(formatNumber(amount));
            $('#sentTo').text(contact.name);
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();

            // Reset form
            $('#sendMoneyForm')[0].reset();
            $('#selectedContact').val('');
            $('#selectedContactId').val('');
            $('.contact-item').removeClass('selected');
            updateBalance();
            submitBtn.prop('disabled', false).html(originalText);

        }, 1500);
    });

    // Función para cargar contactos
    function loadContacts(contactList) {
        const container = $('#contactsContainer');
        container.empty();

        if (contactList.length === 0) {
            container.append('<p class="text-muted text-center">No se encontraron contactos</p>');
            return;
        }

        contactList.forEach(function(contact) {
            const initials = getInitials(contact.name);
            const contactCard = $(`
                <div class="contact-item" data-id="${contact.id}">
                    <div class="contact-avatar">${initials}</div>
                    <div class="text-center">
                        <strong class="d-block">${contact.name}</strong>
                        <small class="text-muted">${contact.email}</small>
                    </div>
                </div>
            `);

            contactCard.on('click', function() {
                selectContact(contact);
            });

            container.append(contactCard);
        });
    }

    // Función para seleccionar contacto
    function selectContact(contact) {
        $('.contact-item').removeClass('selected');
        $(`.contact-item[data-id="${contact.id}"]`).addClass('selected');
        $('#selectedContact').val(contact.name);
        $('#selectedContactId').val(contact.id);

        // Animación
        $('#selectedContact').fadeOut(100).fadeIn(100);
    }

    // Función para obtener iniciales
    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    // Función para verificar balance
    function checkBalance() {
        const amount = parseFloat($('#sendAmount').val()) || 0;
        const alert = $('#insufficientFunds');
        const sendBtn = $('#sendBtn');

        if (amount > currentBalance) {
            alert.removeClass('d-none');
            sendBtn.prop('disabled', true);
        } else {
            alert.addClass('d-none');
            sendBtn.prop('disabled', false);
        }
    }

    // Función para actualizar balance
    function updateBalance() {
        $('#currentBalance').text(formatNumber(currentBalance));
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

    // Función para mostrar notificaciones
    function showNotification(message, type) {
        const notification = $(`
            <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" role="alert" style="z-index: 9999;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        $('body').append(notification);
        setTimeout(() => notification.fadeOut(function() { $(this).remove(); }), 3000);
    }

    // Animación de entrada
    $('.card').hide().fadeIn(600);
});