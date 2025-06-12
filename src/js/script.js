document.addEventListener("DOMContentLoaded", async () => {
  const toggleButton = document.querySelector(".navbar__toogle-btn");
  const mobileMenu = document.querySelector(".mobile");

  const toggleMenu = () => {
    mobileMenu.style.display =
      mobileMenu.style.display === "none" || mobileMenu.style.display === ""
        ? "flex"
        : "none";
  };

  const hideMenuResize = () => {
    mobileMenu.style.display = "none";
  };

  toggleButton.addEventListener("click", toggleMenu);
  window.addEventListener("resize", hideMenuResize);
  window.addEventListener("load", hideMenuResize);

  // Mostrar nombre del usuario si está logueado
  const usuarioId = localStorage.getItem("usuario_id");

  if (usuarioId) {
    try {
      const res = await fetch(`http://localhost:5000/api/usuarios/${usuarioId}`);
      const data = await res.json();

      if (res.ok) {
        const nombreCompleto = `${data.nombre} ${data.apellido}`;

        const navbarTools = document.querySelector(".navbar_tools");
        const bienvenida = document.createElement("span");
        bienvenida.textContent = `Bienvenido, ${nombreCompleto}`;
        bienvenida.style.marginRight = "10px";
        bienvenida.style.fontWeight = "bold";
        bienvenida.style.color = "#0c815e";

        const logoutBtn = document.createElement("button");
        logoutBtn.textContent = "Cerrar sesión";
        logoutBtn.style.marginLeft = "10px";
        logoutBtn.style.padding = "4px 8px";
        logoutBtn.style.cursor = "pointer";
        logoutBtn.style.border = "none";
        logoutBtn.style.backgroundColor = "#d9534f";
        logoutBtn.style.color = "white";
        logoutBtn.style.borderRadius = "5px";

        logoutBtn.addEventListener("click", () => {
          Swal.fire({
            title: "¿Cerrar sesión?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar"
          }).then(result => {
            if (result.isConfirmed) {
              localStorage.removeItem("usuario_id");
              location.reload(); // o redirige a login si prefieres
            }
          });
        });

        navbarTools.prepend(logoutBtn);
        navbarTools.prepend(bienvenida);
      } else {
        console.warn("No se pudo obtener el usuario:", data.message);
      }
    } catch (err) {
      console.error("Error al obtener datos del usuario:", err);
    }
  }
});
