$(function(){
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

  $("#chinese").on("click", function(){
    language = "Chinese";
    $("#language").text("語言");
    $("#search").text("搜尋");
    $("#searchInput").attr("placeholder", "搜尋");
    $("#sunrise").text("日出");
    $("#sunset").text("日落");
    $("#temperature").text("溫度");
  });

  $("#vietnamese").on("click", function(){
    language = "Vietnamese";
    $("#language").text("Ngôn Ngữ");
    $("#search").text("Tìm Kiếm");
    $("#searchInput").attr("placeholder", "Tìm Kiếm");
    $("#sunrise").text("Mặt Trời Mọc");
    $("#sunset").text("Mặt Trời Lặn");
    $("#temperature").text("Nhiệt độ");
  });
});
