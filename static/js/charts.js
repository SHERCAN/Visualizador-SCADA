// Single Line Chart
var ctx3 = $("#line-chart").get(0).getContext("2d");
var myChart3 = new Chart(ctx3, {
  type: "line",
  data: {
    labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
    datasets: [
      {
        label: "Register #",
        fill: false,
        borderColor: "rgba(22, 235, 61, 0.6)",
        pointBackgroundColor: "rgba(22, 235, 61, 1)",
        backgroundColor: "rgba(235, 22, 22, .7)",
        data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15],
      },
    ],
  },
  options: {
    responsive: true,
  },
});
