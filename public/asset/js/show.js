$("input:checkbox").on("click", function(){
  var str = $("#temp").text();
  var pos = str.indexOf("°");
  var temp = parseInt(str.slice(0, pos-1));
  if ($(this).is(":checked")) {
    temp = (temp - 32) * 5 / 9;
    $("#temp").text(temp.toFixed(0) + " °C");
  } else {
    temp = temp * 9 / 5 + 32;
    $("#temp").text(temp.toFixed(0) + " °F");
  }
});
