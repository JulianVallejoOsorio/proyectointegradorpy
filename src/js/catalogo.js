let productos = [];
let categorias = [];
let categoriasSeleccionadas = new Set();

// Cargar categorías desde el backend
async function cargarCategorias() {
    const response = await fetch('http://localhost:8081/api/categories');
    categorias = await response.json();

    const container = document.getElementById('filtersContainer');
    container.innerHTML = '';

    categorias.forEach(categoria => {
        const label = document.createElement('label');
        label.classList.add('filter-label');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = categoria.name;
        checkbox.checked = true;
        checkbox.addEventListener('change', filtrarProductos);

        categoriasSeleccionadas.add(categoria.name);

        label.appendChild(checkbox);
        label.append(categoria.name);
        container.appendChild(label);
    });
}

// Cargar productos desde el backend
async function cargarProductos() {
    const response = await fetch('http://localhost:8081/api/products');
    productos = await response.json();
    mostrarProductos(productos);
}

// Mostrar productos filtrados
function mostrarProductos(productosFiltrados) {
    const container = document.getElementById('productGrid');
    container.innerHTML = '';

    productosFiltrados.forEach(producto => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        card.innerHTML = `
  <img src="${producto.image}" alt="${producto.name}">
  <h3>${producto.name}</h3>
  <p>$${producto.price.toLocaleString()}</p>
  <button onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
`;

        container.appendChild(card);
    });
}

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
        // Busca la categoría del producto
        const categoria = categorias.find(c => c.id === p.categoryId);

        // Verifica si el producto pertenece a una categoría seleccionada
        const categoriaMatch = categoria && categoriasSeleccionadas.has(categoria.name);

        // Verifica si el nombre del producto incluye el texto buscado
        const textoMatch = p.name.toLowerCase().includes(searchTerm);

        // Devuelve true si cumple ambos filtros
        return categoriaMatch && textoMatch;
    });

    mostrarProductos(filtrados);
}


// Agregar al carrito (localStorage)
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
    Swal.fire('¡Agregado!', `${producto.name} fue agregado al carrito.`, 'success');
}

// Inicializar todo al cargar
document.addEventListener('DOMContentLoaded', async () => {
    await cargarCategorias();
    await cargarProductos();
    filtrarProductos(); // aplica filtro inicial
});
