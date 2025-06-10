document.addEventListener("DOMContentLoaded", () => {
    //Seleccion de elementos del DOM
    const toggleButton = document.querySelector(".navbar__toogle-btn");
    const mobileMenu = document.querySelector(".mobile");
    const toggleMenu = () => {
        mobileMenu.style.display =
            mobileMenu.style.display === "none" || mobileMenu.style.display === ""
                ? "flex"
                : "none";
    }
    const hideMenuResize = () => {
        mobileMenu.style.display = "none"
    }
    toggleButton.addEventListener("click", toggleMenu);
    window.addEventListener("resize", hideMenuResize);
    window.addEventListener("load", hideMenuResize);
})

// Obtener elementos
const loginModal = document.getElementById('loginModal');
const loginBtn = document.querySelector('.navbar_icons a[href="#"]'); // El link del icono usuario
const closeBtn = loginModal.querySelector('.close');
const loginForm = document.getElementById('loginForm');

// Abrir modal al hacer clic en icono usuario
loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    loginModal.style.display = 'block';
});

// Cerrar modal al hacer clic en la X
closeBtn.addEventListener('click', function () {
    loginModal.style.display = 'none';
});
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault(); // evitar recarga

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor ingresa usuario y contraseña',
    });
    return;
  }

  // Aquí puedes poner la validación simple, por ejemplo:
  if (username === 'admin' && password === '1234') {
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `Hola, ${username}`,
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      // Redirigir o mostrar algo luego de login exitoso
      window.location.href = 'index.html'; // o tu página principal
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error de inicio',
      text: 'Usuario o contraseña incorrectos',
    });
  }
});
