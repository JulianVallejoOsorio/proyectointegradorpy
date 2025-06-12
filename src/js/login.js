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

// Validación simple
form.addEventListener("submit", function (e) {
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

  if (!valid) {
    form.classList.add("shake");
    setTimeout(() => form.classList.remove("shake"), 300);
    return;
  }

  if (isLogin) {
    alert(`Inicio de sesión exitoso para ${emailInput.value}`);
  } else {
    alert(`Usuario ${nameInput.value} ${lastnameInput.value} registrado correctamente`);
  }

  form.reset();
});

// Funciones auxiliares
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
