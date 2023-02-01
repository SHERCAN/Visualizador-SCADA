// digits fromatt
const formatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
// Slice data
function sliceData(data) {
  let x = data.toString(2).padStart(16, "0");
  let value = [
    parseInt(x.slice(1, 8), 2).toString().padStart(2, "0"),
    parseInt(x.slice(9, 16), 2).toString().padStart(2, "0"),
  ];
  return value;
}
// Actuaización de datos

(async function peticion() {
  const response = await fetch("https://enerion.ml/info");
  // const response = await fetch(window.location.origin + "/info");
  const data = await response.json();
  data.forEach((key) => {
    if (key.name == "BatteryCapacitySOC") {
      let i = Math.round(key.value / 10);
      for (i; i < 11; i++) {
        let bat = document.getElementById("barra-bateria" + i.toString());
        bat.className.baseVal = "barhiding";
      }
    }
  });
})();

async function getData() {
  try {
    const response = await fetch("https://enerion.ml/info");
    // const response = await fetch(window.location.origin + "/info");
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
            day_hour[0] +
            "/" +
            year_month[1] +
            "/" +
            "20" +
            year_month[0] +
            " - " +
            day_hour[1] +
            ":" +
            minute_seconds[0];
          document.getElementById("onlineData").textContent = datos;
        }
        if (key.name == "BatteryCapacitySOC") {
          let bat = document.getElementById(
            "barra-bateria" + Math.round(key.value / 10)
          );
          bat.className.baseVal =
            Math.round(key.value / 10) > Math.floor(key.value / 10) &&
            key.value % 5 == 0
              ? "barhiding"
              : "";
          document.getElementById("Batterystoredenergy").textContent =
            formatter.format(key.value * 0.1024);
        }
        let variable = document.getElementById(key.name);
        if (key.name == "Batteryoutputpower") {
          let bat2invert = document.getElementById("battery2inverter");
          bat2invert.className.baseVal =
            key.value > 0 ? "battery2inverter" : "battery2inverterRev";
        }
        if (key.name == "PVinputpower") {
          let pv2invert = document.getElementById("pv2inverter");
          pv2invert.className.baseVal = key.value > 0 ? "pv2inverter" : "";
        }
        if (key.name == "LoadsideTotalpower") {
          let invert2load = document.getElementsByClassName("inverter2load");
          for (let i = 0; i < invert2load.length; i++) {
            invert2load[i].className.baseVal =
              key.value > 0
                ? "inverter2loadAni inverter2load"
                : "inverter2load";
          }
        }
        let listPower = [
          "Loadfrequency",
          "GridsidevoltageL1-N",
          "GridsidevoltageL2-N",
          "Batteryvoltage",
          "Batterytemperature",
          "InverteroutputvoltageL1-N",
          "InverteroutputvoltageL2-N",
          "Inverteroutputfrequency",
          "BatteryCapacitySOC",
        ];
        variable.textContent = Number.isInteger(key.value)
          ? key.value
          : Math.round(key.value);
        if (!listPower.includes(key.name)) {
          if (key.value > 1000) {
            variable.textContent = formatter.format(key.value / 1000);
            variable.nextElementSibling.textContent = "kW";
          } else {
            variable.nextElementSibling.textContent = "W";
          }
        }
      } catch (error) {}
    });
  } catch (error) {}
}
setInterval(getData, 250);
