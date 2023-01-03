const modal = document.querySelector(".container-modal");
const carrusel = document.querySelector(".carrusel");
const slides = document.querySelectorAll(".slide");

function mostrarModalGrid(element) {
  console.log(element);
  var elemento = element;
  modal.style.display = "flex";
  const slide = document.querySelectorAll("#slide1");
  slide.style.opacity = 1;
}

function ocultarModal() {
  modal.style.display = "none";
}

function anteriorSlide() {
  carrusel.style.left = "0";
}

function siguienteSlide() {
  carrusel.style.left = "-100%";
}

// Muestra el modal al hacer clic en un botón o enlace
// document.querySelector(".boton-modal").addEventListener("click", mostrarModal);
