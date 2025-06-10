const USER_ID = 4; // Puedes reemplazarlo con el real si luego lo quieres dinámico

// Obtener carrito desde localStorage
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

// Guardar carrito en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Mostrar carrito en la página
function mostrarCarrito() {
    const carritoItems = document.getElementById('carritoItems');
    const totalCarrito = document.getElementById('totalCarrito');
    carritoItems.innerHTML = '';

    let total = 0;
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p>Tu carrito está vacío.</p>';
        totalCarrito.textContent = 'Total: $0';
        return;
    }

    carrito.forEach((producto, index) => {
        const subtotal = producto.price * producto.cantidad;
        total += subtotal;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('carrito-item');

        itemDiv.innerHTML = `
            <img src="${producto.image}" alt="${producto.name}" class="carrito-item-img">
            <div class="carrito-item-info">
                <h4>${producto.name}</h4>
                <p>Precio unitario: $${producto.price.toLocaleString()}</p>
                <label>
                    Cantidad:
                    <input type="number" min="1" value="${producto.cantidad}" data-index="${index}" class="cantidad-input" />
                </label>
                <p>Subtotal: $${subtotal.toLocaleString()}</p>
                <button class="btn-eliminar" data-index="${index}">Eliminar</button>
            </div>
        `;

        carritoItems.appendChild(itemDiv);
    });

    totalCarrito.textContent = `Total: $${total.toLocaleString()}`;

    document.querySelectorAll('.cantidad-input').forEach(input => {
        input.addEventListener('change', cambiarCantidad);
    });

    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', eliminarDelCarrito);
    });
}

function cambiarCantidad(event) {
    const index = event.target.dataset.index;
    let nuevaCantidad = parseInt(event.target.value);

    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        Swal.fire('Error', 'La cantidad debe ser un número mayor o igual a 1.', 'error');
        event.target.value = 1;
        nuevaCantidad = 1;
    }

    const carrito = obtenerCarrito();
    carrito[index].cantidad = nuevaCantidad;
    guardarCarrito(carrito);
    mostrarCarrito();
}

function eliminarDelCarrito(event) {
    const index = event.target.dataset.index;
    let carrito = obtenerCarrito();
    carrito.splice(index, 1);
    guardarCarrito(carrito);
    mostrarCarrito();
    Swal.fire('Eliminado', 'Producto eliminado del carrito.', 'success');
}


// Login y guardar token
async function loginYObtenerToken(email, password) {
    try {
        const response = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Credenciales incorrectas');
        }

        const data = await response.json();
        console.log('Respuesta del login:', data);

        const token = data.token || data.accessToken;
        if (!token) {
            throw new Error("Token no recibido del backend");
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('tokenType', data.tokenType || 'Bearer');
        return token;
    } catch (error) {
        console.error('Error en login:', error);
        Swal.fire('Error de autenticación', error.message, 'error');
        throw error;
    }
}


// Finalizar compra
async function finalizarCompra() {
    try {
        const carrito = obtenerCarrito();
        if (carrito.length === 0) {
            Swal.fire('Carrito vacío', 'Agrega productos antes de finalizar la compra.', 'info');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire('No autenticado', 'Por favor inicia sesión primero.', 'info');
            return;
        }

        const total = carrito.reduce((sum, p) => sum + (p.price * p.cantidad), 0);

        const ventaResponse = await fetch('http://localhost:8081/api/sales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                total: parseFloat(total.toFixed(2)),
                user: { id: USER_ID }
            })
        });

        if (!ventaResponse.ok) {
            const errorText = await ventaResponse.text();
            console.error("Error al crear venta:", errorText);
            throw new Error('Error al crear la venta');
        }

        const venta = await ventaResponse.json();

        for (const producto of carrito) {
            const detalleResponse = await fetch('http://localhost:8081/api/sales-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sale: { id: venta.id },
                    product: { id: producto.id },
                    quantity: producto.cantidad,
                    price: producto.price
                })
            });

            if (!detalleResponse.ok) {
                const errorText = await detalleResponse.text();
                console.error("Error en detalle:", errorText);
                throw new Error('Error en detalle de venta');
            }
        }

        localStorage.removeItem('carrito');
        mostrarCarrito();
        Swal.fire('Compra completada', '¡Gracias por tu compra!', 'success');

    } catch (error) {
        console.error("Error al finalizar compra:", error);
        Swal.fire('Error', error.message || 'Ocurrió un error al procesar la compra.', 'error');
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', async () => {
    mostrarCarrito();

    if (!localStorage.getItem('token')) {
        try {
            const { value: formValues } = await Swal.fire({
                title: 'Iniciar sesión',
                html:
                    '<input id="swal-email" class="swal2-input" placeholder="Correo electrónico">' +
                    '<input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña">',
                focusConfirm: false,
                preConfirm: () => {
                    const email = document.getElementById('swal-email').value;
                    const password = document.getElementById('swal-password').value;
                    if (!email || !password) {
                        Swal.showValidationMessage('Email y contraseña requeridos');
                    }
                    return { email, password };
                }
            });

            if (formValues) {
                await loginYObtenerToken(formValues.email, formValues.password);
            }
        } catch (error) {
            console.error("Login automático fallido:", error);
        }
    }

    const btnFinalizar = document.getElementById('finalizarCompraBtn');
    btnFinalizar.addEventListener('click', finalizarCompra);
});
