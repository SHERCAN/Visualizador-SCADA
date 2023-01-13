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
const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function sliceData(data) {
  let x = data.toString(2).padStart(16, "0");
  let value = [
    parseInt(x.slice(1, 8), 2).toString().padStart(2, "0"),
    parseInt(x.slice(9, 16), 2).toString().padStart(2, "0"),
  ];
  return value;
}
// Actuaización de datos
async function getData() {
  try {
    // const response = await fetch("http://localhost:8000/info");
    const response = await fetch(window.location.origin + "/info");
    const data = await response.json();
    var year_month;
    var day_hour;
    var minute_seconds;
    data.forEach((key) => {
      try {
        if (key.name == "YearANDMonth") {
          year_month = sliceData(key.value);
        }
        if (key.name == "DayANDHour") {
          day_hour = sliceData(key.value);
        }
        if (key.name == "MinuteANDSecond") {
          minute_seconds = sliceData(key.value);
          let datos =
            "20" +
            year_month[0] +
            "-" +
            year_month[1] +
            "-" +
            day_hour[0] +
            "-" +
            day_hour[1] +
            ":" +
            minute_seconds[0] +
            ":" +
            minute_seconds[1];
          document.getElementById("onlineData").innerHTML = datos;
        }
        if (key.name == "BatteryCapacitySOC") {
          document.getElementById("Batterystoredenergy").innerHTML =
            formatter.format(key.value * 0.1024);
        }
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
    if (
      element.classList.contains("left-arrow") ||
      element.classList.contains("arrow-green-left")
    ) {
      element.setAttribute("class", "arrow-green-left");
    } else {
      element.setAttribute("class", "arrow-green");
    }
  } else if (number > 0) {
    if (
      element.classList.contains("left-arrow") ||
      element.classList.contains("arrow-red-left")
    ) {
      element.setAttribute("class", "arrow-red-left");
    } else {
      element.setAttribute("class", "arrow-red");
    }
  } else {
    if (
      element.classList.contains("left-arrow") ||
      element.classList.contains("arrow-gray-left")
    ) {
      element.setAttribute("class", "arrow-gray-left");
    } else {
      element.setAttribute("class", "arrow-gray");
    }
  }
}
