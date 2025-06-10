document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();
    const mensajeError = document.getElementById("mensajeError");

    // Usuarios de prueba
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [
        { usuario: "admin", password: "1234" },
        { usuario: "user", password: "pass" }
    ];

    const userEncontrado = usuarios.find(u => u.usuario === usuario && u.password === password);

    if (userEncontrado) {
        localStorage.setItem("usuarioActivo", usuario);
        window.location.href = "paginaPrivada.html";
    } else {
        mensajeError.style.display = "block";
        mensajeError.textContent = "Usuario o contraseña incorrectos.";
    }
});
