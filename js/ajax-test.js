// DOM manipulation
// console.log(document.getElementById("main-content"));
// console.log(document instanceof HTMLDocument);
document.addEventListener("DOMContentLoaded", function (event) {

  document.querySelector("header").innerHTML += ("<button id='btn' style='color:black;border-radius:8px;'>button</button>");

  document.querySelector("#btn").onclick = function () {

    // Call server to get the name
    $ajaxUtils.sendGetRequest("/data/name.json", function (res) {

      var msg = res.firstName + " " + res.lastName;

      if (res.likesPizza) {
        msg += " likes pizza";
      } else {
        msg += " doesn't like pizza";
      }
      msg += " and uses ";
      msg += res.numberOfDisplays + 1;
      msg += " displays for coding.";

      document.querySelector("#main").innerHTML = "<h2>" + msg + "</h2>";

    });


  };
});
