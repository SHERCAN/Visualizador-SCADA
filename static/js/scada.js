const modal = document.querySelector(".container-modal");
const carrusel = document.querySelector(".carrusel");
const liElements = document.querySelectorAll("ul.slider li"); // Selecciona todos los elementos li de la lista ul
var elemento;
function mostrarModalGrid(element) {
  elemento = element;
  const slide = document.querySelector(element);
  // const slideUl = document.querySelector(element);
  //   slide.style.opacity = 1;
  modal.style.display = "flex";
}

function ocultarModal() {
  modal.style.display = "none";
  const slide = document.querySelector(elemento);
  //   slide.style.opacity = "";
  //   liElements.forEach((li) => {
  //     li.style.opacity = 0; // Establece la opacidad en 0
  //   });
}

function anteriorSlide() {
  carrusel.style.left = "0";
}

function siguienteSlide() {
  carrusel.style.left = "-100%";
}

// Muestra el modal al hacer clic en un botón o enlace
// document.querySelector(".boton-modal").addEventListener("click", mostrarModal);
