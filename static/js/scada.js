const modal = document.querySelector(".container-modal");
const carrusel = document.querySelector(".carrusel");
const liElements = document.querySelectorAll("ul.slider li"); // Selecciona todos los elementos li de la lista ul
var elemento;
function mostrarModalGrid(element) {
  elemento = element;
  const slide = document.querySelector(element);
  // const slideUl = document.querySelector(element);
  //   slide.style.opacity = 1;
  modal.style.display = "block";
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

// Actuaización de datos
async function getData() {
  try {
    const response = await fetch("http://localhost:8000/info");
    // const response = await fetch("http://shercan.ga/info");
    const data = await response.json();
    data.forEach((key) => {
      try {
        document.getElementById(key.name).innerHTML = key.value;
        updateArrow(key.name, key.value);
      } catch (error) {}
    });
  } catch (error) {}
}
setInterval(getData, 250);

// flechas de visualización
function updateArrow(name, number) {
  let arrow = name + "arrow";
  let element = document.getElementById(arrow);
  if (number < 0) {
    if (element.classList.contains("left-arrow")) {
      console.log(element.classList.contains("left-arrow"));
      element.setAttribute("class", "arrow-red-left");
    } else {
      element.setAttribute("class", "arrow-red");
    }
  } else if (number > 0) {
    if (element.classList.contains("left-arrow")) {
      element.setAttribute("class", "arrow-green-left");
    } else {
      element.setAttribute("class", "arrow-green");
    }
  } else {
    if (element.classList.contains("left-arrow")) {
      element.setAttribute("class", "arrow-gray-left");
    } else {
      element.setAttribute("class", "arrow-gray");
    }
  }
}
