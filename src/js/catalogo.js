let productos = [];
let categorias = [];
let categoriasSeleccionadas = new Set();

// Cargar categorías desde la API Flask
async function cargarCategorias() {
    try {
        const response = await fetch('http://localhost:5000/api/categorias');
        categorias = await response.json();

        const container = document.getElementById('filtersContainer');
        container.innerHTML = '';

        categorias.forEach(categoria => {
            const label = document.createElement('label');
            label.classList.add('filter-label');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = categoria.nombre; // nombre = campo de la API
            checkbox.checked = true;
            checkbox.addEventListener('change', filtrarProductos);

            categoriasSeleccionadas.add(categoria.nombre);

            label.appendChild(checkbox);
            label.append(categoria.nombre);
            container.appendChild(label);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

// Cargar productos desde la API Flask
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:5000/api/productos');
        productos = await response.json();
        mostrarProductos(productos);
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

// Mostrar productos en el catálogo
function mostrarProductos(productosFiltrados) {
    const container = document.getElementById('productGrid');
    container.innerHTML = '';

    productosFiltrados.forEach(producto => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toLocaleString()}</p>
            <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
        `;

        container.appendChild(card);
    });
}

// Filtrar productos por categoría y búsqueda
function filtrarProductos() {
    const checkboxes = document.querySelectorAll('#filtersContainer input[type="checkbox"]');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    categoriasSeleccionadas.clear();
    checkboxes.forEach(chk => {
        if (chk.checked) {
            categoriasSeleccionadas.add(chk.value);
        }
    });

    const filtrados = productos.filter(p => {
        const categoria = categorias.find(c => c.id === p.categoria_id);
        const categoriaMatch = categoria && categoriasSeleccionadas.has(categoria.nombre);
        const textoMatch = p.nombre.toLowerCase().includes(searchTerm);
        return categoriaMatch && textoMatch;
    });

    mostrarProductos(filtrados);
}

// Agregar al carrito en localStorage
function agregarAlCarrito(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const index = carrito.findIndex(p => p.id === producto.id);
    if (index !== -1) {
        carrito[index].cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    Swal.fire('¡Agregado!', `${producto.nombre} fue agregado al carrito.`, 'success');
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCategorias();
    await cargarProductos();
    filtrarProductos(); // aplicar filtro inicial
});
