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
  $("#state").autocomplete({
    source: data,
  });
});
// companys and rates contract
$(function () {
  let url =
    window.location.origin +
    "/companyrate/?value=" +
    "https://openei.org/w/api.php?action=sfautocomplete&limit=500&substr=te&format=json&category=EIA%20Utility%20Companies%20and%20Aliases";
  url = url.replace(/&/g, "%26");
  $.getJSON(url, function (data) {
    $("#electricCo").autocomplete({
      source: data,
    });
  });
});
$(document).ready(function () {
  $("#electricCo").change(function () {
    $("#sector").prop("disabled", false);
  });
});
$(document).ready(function () {
  $("#sector").change(function () {
    companys = document.getElementById("electricCo").value;
    sector = document.getElementById("sector").value;
    let url =
      window.location.origin +
      "/companyrate/?value=" +
      "https://api.openei.org/utility_rates?version=latest&format=json&api_key=XVKe43UvrJ0mduASGIthdBV2yCvzfdAjmaaW6cuZ&sector=" +
      sector +
      "&orderby=enddate&limit=30&sector=Residential&ratesforutility=" +
      companys;
    url = url.replace(/&/g, "%26");
    $("#ratename").prop("disabled", false);
    $.getJSON(url, function (data) {
      $("#ratename").autocomplete({
        source: data,
      });
    });
  });
});
