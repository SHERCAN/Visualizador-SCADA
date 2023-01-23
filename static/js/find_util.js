// States and cities
var states = "";
$(function () {
  $.getJSON(
    "https://gist.githubusercontent.com/ahmu83/38865147cf3727d221941a2ef8c22a77/raw/c647f74643c0b3f8407c28ddbb599e9f594365ca/US_States_and_Cities.json",
    function (data) {
      states = Object.keys(data);
      $("#state").autocomplete({
        source: states,
      });
    }
  );
});
$(document).ready(function () {
  $("#state").change(function () {
    $.getJSON(
      "https://gist.githubusercontent.com/ahmu83/38865147cf3727d221941a2ef8c22a77/raw/c647f74643c0b3f8407c28ddbb599e9f594365ca/US_States_and_Cities.json",
      function (data) {
        let cities = data[document.getElementById("state").value];
        $("#city").prop("disabled", false);
        $("#city").autocomplete({
          source: cities,
        });
      }
    );
  });
});
// Type of the service
$(function () {
  let data = ["Residential", "Commercial", "Industrial", "Lighting"];
  $("#sector").autocomplete({
    source: data,
  });
});
// companys and rates contract
$(function () {
  $("#electricCo").autocomplete({
    source: function (req, add) {
      let url =
        window.location.protocol +
        "//" +
        window.location.host +
        "/companyrate/?value=companies&substr=" +
        req.term;
      $.getJSON(url, function (data) {
        var suggestions = [];
        var maxResults = 20;
        var endResult = Math.min(maxResults, data.length);
        for (i = 0; i < endResult; i++) {
          suggestions.push(data[i]);
        }
        add(suggestions);
      });
    },
    delay: 75,
    minLength: 2,
  });
});

//------------
// $(function () {
//   let url =
//     window.location.protocol +
//     "//" +
//     window.location.host +
//     "/companyrate/?value=" +
//     "https://openei.org/w/api.php?action=sfautocomplete&limit=500&substr=te&format=json&category=EIA%20Utility%20Companies%20and%20Aliases";
//   url = url.replace(/&/g, "%26");
//   $.getJSON(url, function (data) {
//     $("#electricCo").autocomplete({
//       source: data,
//     });
//   });
// });
$(document).ready(function () {
  $("#electricCo").change(function () {
    $("#sector").prop("disabled", false);
  });
});
$(document).ready(function () {
  $("#sector").change(function () {
    company = document.getElementById("electricCo").value.replace(/&/g, "%26");
    sector = document.getElementById("sector").value.replace(/&/g, "%26");
    let url =
      window.location.protocol +
      "//" +
      window.location.host +
      "/companyrate/?value=rates&sector=" +
      sector +
      "&company=" +
      company;
    $("#ratename").prop("disabled", false);
    $.getJSON(url, function (data) {
      $("#ratename").autocomplete({
        source: data,
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("formCl")
    .addEventListener("submit", validarFormulario);
});

function validarFormulario(evento) {
  evento.preventDefault();
  var state = document.getElementById("state").value;
  var city = document.getElementById("city").value;
  var zipcode = document.getElementById("zipcode").value;
  var electricCo = document.getElementById("electricCo").value;
  var sector = document.getElementById("sector").value;
  var ratename = document.getElementById("ratename").value;
  var client = document.getElementById("client").value;
  if (
    state.length > 4 &&
    city.length > 4 &&
    zipcode.length > 4 &&
    electricCo.length > 4 &&
    sector.length > 4 &&
    ratename.length > 4 &&
    client.length > 4
  ) {
    alert("Data sent");
    this.submit();
  } else {
    alert("Missing data");
    return;
  }
}
