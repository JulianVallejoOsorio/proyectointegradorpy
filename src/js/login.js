const form = document.getElementById("form");
const nameInput = document.getElementById("name");
const lastnameInput = document.getElementById("lastname");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const formTitle = document.getElementById("form-title");
const toggleMsg = document.getElementById("toggle-msg");
const toggleLink = document.getElementById("toggle-link");
const submitBtn = document.getElementById("submit-btn");

const nameGroup = document.getElementById("name-group");
const lastnameGroup = document.getElementById("lastname-group");

let isLogin = false;

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  let valid = true;
  clearErrors();

  if (!isLogin) {
    if (nameInput.value.trim() === "") {
      markError(nameInput);
      valid = false;
    }
    if (lastnameInput.value.trim() === "") {
      markError(lastnameInput);
      valid = false;
    }
  }

  if (!validateEmail(emailInput.value)) {
    markError(emailInput);
    valid = false;
  }

  if (passwordInput.value.length < 6) {
    markError(passwordInput);
    valid = false;
  }

  if (!valid) return shakeForm();

  if (isLogin) {
    // INICIAR SESIÓN
    try {
      const res = await fetch("http://localhost:5000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: emailInput.value,
          clave: passwordInput.value
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("¡Bienvenido!", "Has iniciado sesión correctamente", "success").then(() => {
          localStorage.setItem("usuario_id", data.usuario_id);
          form.reset();
          window.location.href = "../../index.html"; // Cambia esta ruta si es diferente
        });
      } else {
        Swal.fire("Error", data.message || "Credenciales inválidas", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    }
  } else {
    // REGISTRARSE
    try {
      const res = await fetch("http://localhost:5000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nameInput.value,
          apellido: lastnameInput.value,
          correo: emailInput.value,
          clave: passwordInput.value
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Registrado", "Usuario creado correctamente", "success").then(() => {
          form.reset();
          toggleLink.click(); // Cambiar automáticamente al formulario de login
        });
      } else {
        Swal.fire("Error", data.message || "No se pudo registrar", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  }
});

function markError(input) {
  input.classList.add("error");
}

function clearErrors() {
  [nameInput, lastnameInput, emailInput, passwordInput].forEach(input => {
    input.classList.remove("error");
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeForm() {
  form.classList.add("shake");
  setTimeout(() => form.classList.remove("shake"), 300);
}

// Cambio entre login y registro
toggleLink.addEventListener("click", function (e) {
  e.preventDefault();
  isLogin = !isLogin;

  formTitle.textContent = isLogin ? "Iniciar Sesión" : "Registrarse";
  toggleMsg.textContent = isLogin ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?";
  toggleLink.textContent = isLogin ? "Registrarse" : "Iniciar Sesión";
  submitBtn.textContent = isLogin ? "Entrar" : "Registrarse";

  nameGroup.style.display = isLogin ? "none" : "block";
  lastnameGroup.style.display = isLogin ? "none" : "block";
});
