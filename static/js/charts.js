// Class manage before
var elements = document.getElementsByClassName("dates");
function manageClass() {
  let divIn = this;
  Array.from(elements).forEach(function (element) {
    if (divIn != element) {
      element.classList.remove("text-temp");
    } else {
      element.classList.add("text-temp");
      getSql(element.innerText.replace(/\s+/g, ""));
    }
  });
}
Array.from(elements).forEach(function (element) {
  element.addEventListener("click", manageClass);
});
// Single Line Chart
var ctx = $("#line-chart").get(0).getContext("2d");
Chart.defaults.color = "#8ab4f8";
Chart.defaults.borderColor = "#ffffff80";
const tooltipLine = {
  id: "tooltipLine",
  beforeDraw: (chart) => {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const ctx = chart.ctx;
      ctx.save();
      const activePoint = chart.tooltip._active[0];
      ctx.beginPath();
      ctx.setLineDash([5, 2]);
      ctx.moveTo(activePoint.element.x, chart.chartArea.top);
      ctx.lineTo(activePoint.element.x, chart.chartArea.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#D3D3D3";
      ctx.stroke();
      ctx.restore();
    }
  },
};

function gradients(color) {
  var gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.8, "#00000000");
  gradient.addColorStop(1, "#00000000");
  return gradient;
}
const config = {
  type: "line",
  data: {
    labels: [1, 2, 3, 4, 5, 6, 7],
    datasets: [
      {
        fill: true,
        label: "Battery Capacity SOC",
        data: [
          12, 19, 3, 17, 6, 3, 7, 13, 15, 1, 20, 13, 16, 3, 12, 6, 7, 4, 3, 1,
          6, 4, 8, 9, 1, 8, 1, 1, 16, 17, 15, 13, 12,
        ],
        borderColor: "#38FF25",
        pointBackgroundColor: "#38FF252",
        backgroundColor: gradients("#38FF25"),
        hidden: true,
        tension: 0.1,
        pointRadius: 1,
      },
      {
        fill: true,
        label: "Battery Output Power",
        data: [
          12, 19, 3, 17, 6, 3, 7, 13, 15, 1, 20, 13, 16, 3, 12, 6, 7, 4, 3, 1,
          6, 4, 8, 9, 1, 8, 1, 1, 16, 17, 15, 13, 12,
        ],
        borderColor: "#0F5DA2",
        pointBackgroundColor: "#0F5DA2",
        backgroundColor: gradients("#0F5DA2"),
        tension: 0.1,
        pointRadius: 1,
      },
      {
        fill: true,
        label: "Inverter Output Total Power",
        data: [5, 13, 5, 5, 14, 3, 2],
        borderColor: "#EE0D0D",
        pointBackgroundColor: "#EE0D0D",
        backgroundColor: gradients("#EE0D0D"),
        hidden: true,
        tension: 0.1,
        pointRadius: 1,
      },
    ],
  },
  options: {
    hover: {
      intersect: false,
    },
    plugins: {
      legend: {
        onClick: (e, legendItem, legend) => {
          const datasets = legend.legendItems.map((dataset, index) => {
            return dataset.text;
          });
          var index = datasets.indexOf(legendItem.text);
          getSql(temporaryGlobal, legendItem.text.replace(/\s+/g, ""), index);
          const showValue = myChart.isDatasetVisible(legendItem.datasetIndex);
          var ci = myChart;
          if (!showValue) {
            ci.data.datasets.forEach(function (e, i) {
              if (index != i) {
                ci.hide(i);
              } else {
                ci.show(i);
              }
            });
          }
        },
        labels: {
          generateLabels: (chart) => {
            let visibility = [];
            for (let i = 0; i < chart.data.datasets.length; i++) {
              // console.log(chart.isDatasetVisible(i));
              if (chart.isDatasetVisible(i) === true) {
                // console.log(i);
                visibility.push("#00adeb");
              } else {
                visibility.push("#D6D6D680");
              }
            }
            // console.log(visibility);
            return chart.data.datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.backgroundColor,
              strokeStyle: dataset.backgroundColor,
              fontColor: visibility[index],
            }));
          },
          useBorderRadius: true,
          borderRadius: 6,
          boxWidth: 12,
          // color: "#00adeb",
        },
      },
      labels: {
        color: "#4f4f51",
        padding: 10,
        boxWidth: 40,
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
      crosshair: {
        line: {
          color: "#fff", // crosshair line color
          width: 1, // crosshair line width
        },
        sync: {
          enabled: false,
        },
        zoom: {
          enabled: false,
        },
        snap: {
          enabled: true,
        },
      },
      tooltip: {
        intersect: false,
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "hour" },
        ticks: {
          callback: (value, index, ticks) => {
            const date = new Date(value);
            // console.log(ticks);
            let timeReturn = new Intl.DateTimeFormat("en-US", {
              day: "2-digit",
              month: "short",
            }).format(date);
            if (index % 2 === 0) {
              return timeReturn;
            } else {
              return "";
            }
          },
          autoSkip: true,
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
  },
  // plugins: [tooltipLine],
  // plugins: {  },
};
var keyGlobal = null;
var temporaryGlobal = null;
var indexGlobal = null;
var myChart = new Chart(ctx, config);
function getSql(
  temporary = temporaryGlobal,
  key = keyGlobal,
  index = indexGlobal
) {
  temporaryGlobal = temporary;
  keyGlobal = key;
  indexGlobal = index;
  var url =
    window.location.origin + "/db?key=" + key + "&temporary=" + temporary;
  $.getJSON(url, function (data) {
    myChart.data.labels = data[0];
    myChart.data.datasets[index].data = data[1];
    myChart.update();
  });
}

function petirE() {
  keyGlobal = "BatteryOutputPower";
  temporaryGlobal = "1D";
  indexGlobal = 1;
  var url = window.location.origin + "/db?key=BatteryOutputPower&temporary=1D";
  $.getJSON(url, function (data) {
    myChart.data.labels = data[0];
    myChart.data.datasets[indexGlobal].data = data[1];
    myChart.update();
  });
}
window.onload = petirE();
