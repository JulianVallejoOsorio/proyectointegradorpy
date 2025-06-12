document.addEventListener('DOMContentLoaded', () => {
    const carritoItemsContainer = document.getElementById('carritoItems');
    const totalCarritoElement = document.getElementById('totalCarrito');
    const finalizarCompraBtn = document.getElementById('finalizarCompraBtn');

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const usuarioId = localStorage.getItem('usuario_id');

    if (!usuarioId) {
        Swal.fire({
            icon: 'warning',
            title: 'No has iniciado sesión',
            text: 'Debes iniciar sesión para finalizar la compra.',
            confirmButtonText: 'Iniciar sesión'
        }).then(() => {
            window.location.href = '../pages/login.html';
        });
        return;
    }

    const renderCarrito = () => {
        carritoItemsContainer.innerHTML = '';
        let total = 0;

        carrito.forEach((producto, index) => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('carrito-item');
            itemDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="carrito-item-img">
                <div class="carrito-item-info">
                    <h4>${producto.nombre}</h4>
                    <p>Precio unitario: $${producto.precio.toLocaleString()}</p>
                    <label>
                        Cantidad:
                        <input type="number" min="1" value="${producto.cantidad}" data-index="${index}" class="cantidad-input" />
                    </label>
                    <p>Subtotal: $${subtotal.toLocaleString()}</p>
                    <button class="btn-eliminar" data-index="${index}">Eliminar</button>
                </div>
            `;
            carritoItemsContainer.appendChild(itemDiv);
        });

        totalCarritoElement.textContent = `Total: $${total.toLocaleString()}`;
        localStorage.setItem('carrito', JSON.stringify(carrito));
    };

    carritoItemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('cantidad-input')) {
            const index = e.target.dataset.index;
            const nuevaCantidad = parseInt(e.target.value);
            if (nuevaCantidad > 0) {
                carrito[index].cantidad = nuevaCantidad;
                renderCarrito();
            }
        }
    });

    carritoItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar')) {
            const index = e.target.dataset.index;

            Swal.fire({
                title: '¿Eliminar este producto?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    carrito.splice(index, 1);
                    renderCarrito();
                    Swal.fire('Eliminado', 'El producto ha sido eliminado del carrito.', 'success');
                }
            });
        }
    });

    finalizarCompraBtn.addEventListener('click', async () => {
        if (carrito.length === 0) {
            Swal.fire('Carrito vacío', 'Agrega productos antes de finalizar la compra.', 'info');
            return;
        }

        const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
        const detalle = carrito.map(p => ({
            id_producto: p.id,
            cantidad: p.cantidad,
            precio: p.precio
        }));

        try {
            const response = await fetch('http://localhost:5000/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: usuarioId,
                    total: total,
                    estado: 'finalizada',
                    detalle: detalle
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Error al finalizar la compra.');
            }

            Swal.fire({
                icon: 'success',
                title: '¡Compra realizada!',
                text: 'Gracias por tu compra en AgroJardín.'
            });

            carrito = [];
            localStorage.removeItem('carrito');
            renderCarrito();

        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    });

    renderCarrito();
});

const ventasContainer = document.getElementById('ventasHistorico');

// Obtener usuario_id de localStorage
const usuarioId = localStorage.getItem('usuario_id');

// Función para cargar historial de ventas
const cargarHistorialDeVentas = async () => {
    try {
        const response = await fetch(`http://localhost:5000/api/ventas/usuario/${usuarioId}`);
        if (!response.ok) throw new Error('Error al obtener historial');

        const ventas = await response.json();

        if (ventas.length === 0) {
            ventasContainer.innerHTML = '<p>No tienes compras realizadas aún.</p>';
            return;
        }

        ventasContainer.innerHTML = '';

        ventas.forEach(venta => {
            const ventaDiv = document.createElement('div');
            ventaDiv.classList.add('venta-item');

            let productosHTML = '';
            venta.detalle.forEach(prod => {
                productosHTML += `
                    <div class="detalle-item">
                        ${prod.nombre_producto} - ${prod.cantidad} x $${parseFloat(prod.precio).toLocaleString()}
                    </div>
                `;
            });

            ventaDiv.innerHTML = `
                <h4>Venta #${venta.id}</h4>
                <p><strong>Fecha:</strong> ${venta.fecha}</p>
                <p><strong>Total:</strong> $${parseFloat(venta.total).toLocaleString()}</p>
                <div class="detalles-venta">${productosHTML}</div>
                <div class="venta-actions">
                    <button class="btn-editar btn-editar-venta" data-id="${venta.id}" data-detalle='${JSON.stringify(venta.detalle)}'>Editar</button>
                    <button class="btn-eliminar btn-eliminar-venta" data-id="${venta.id}">Eliminar</button>
                </div>
            `;

            ventasContainer.appendChild(ventaDiv);
        });

    } catch (error) {
        console.error(error);
        ventasContainer.innerHTML = '<p>Error al cargar historial de compras.</p>';
    }
};

// Manejar clics en los botones de eliminar o editar
ventasContainer.addEventListener('click', async (e) => {
    const ventaId = e.target.dataset.id;

    // Eliminar venta
    if (e.target.classList.contains('btn-eliminar-venta')) {
        const confirm = await Swal.fire({
            title: '¿Eliminar esta venta?',
            text: 'Se eliminará la venta y sus productos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`http://localhost:5000/api/ventas/${ventaId}`, {
                    method: 'DELETE'
                });

                if (!res.ok) throw new Error('Error al eliminar venta');

                Swal.fire('Eliminada', 'Venta eliminada correctamente', 'success');
                cargarHistorialDeVentas();
            } catch (err) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    }

    // Editar venta
    if (e.target.classList.contains('btn-editar-venta')) {
        const detalle = JSON.parse(e.target.dataset.detalle);

        const formHtml = detalle.map((item, index) => `
            <div style="margin-bottom: 10px;">
                <label>${item.nombre_producto}</label><br>
                <input type="number" min="1" value="${item.cantidad}" id="cantidad-${index}" style="width: 60px;" /> x 
                <input type="number" min="0.01" step="0.01" value="${item.precio}" id="precio-${index}" style="width: 80px;" /> 
            </div>
        `).join('');

        const { isConfirmed } = await Swal.fire({
            title: 'Editar Venta',
            html: formHtml,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar cambios',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return detalle.map((item, index) => ({
                    id_producto: item.id_producto,
                    cantidad: parseInt(document.getElementById(`cantidad-${index}`).value),
                    precio: parseFloat(document.getElementById(`precio-${index}`).value)
                }));
            }
        });

        if (isConfirmed) {
            const detalleActualizado = detalle.map((item, index) => ({
                id_producto: item.id_producto,
                cantidad: parseInt(document.getElementById(`cantidad-${index}`).value),
                precio: parseFloat(document.getElementById(`precio-${index}`).value)
            }));

            const nuevoTotal = detalleActualizado.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

            try {
                const res = await fetch(`http://localhost:5000/api/ventas/${ventaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        total: nuevoTotal,
                        detalle: detalleActualizado
                    })
                });

                if (!res.ok) throw new Error('Error al actualizar la venta');

                Swal.fire('Actualizada', 'La venta fue actualizada correctamente.', 'success');
                cargarHistorialDeVentas();
            } catch (err) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    }
});

// Inicializar historial
cargarHistorialDeVentas();
