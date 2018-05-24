var express = require("express"),
	app = express(),
	request = require("request"),
	bodyParser = require("body-parser"),
	flash = require("connect-flash");
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: 'AIzaSyA7szZpDHv4AZyn-tqsQoKyo3SqXVMYMog',
  formatter: null
};

var geocoder = NodeGeocoder(options);


//======================================================================
//						APP CONFIGURATION
//======================================================================
app.use(require("express-session")({
	secret: "Candy is the cutest dog in the world!",
	resave: false,
	saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(flash());
app.set("view engine", "ejs");
app.use(function (req, res, next) {
  	res.locals.url = [];
  	res.locals.isInLanding = false;
  	res.locals.error = req.flash("error");
  	next()
})
//======================================================================
//							INDEX ROUTE
//======================================================================
app.get("/", function(req, res){
	res.locals.isInLanding = true;
	res.render("landing");
});

//======================================================================
//							SHOW ROUTE
//======================================================================
app.post("/city", function(req, res){
	var city = req.body.city;
	geocoder.geocode(city, function (err, data) {
	    if (err || !data.length) {
	      	req.flash('error', 'Invalid address');
	      	return res.redirect('back');
	    }
	    var lat = data[0].latitude;
	    var lng = data[0].longitude;
	    var location = data[0].formattedAddress;
	    var placeId = data[0].extra.googlePlaceId;
	    // get photos of locations
		request("https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=AIzaSyAX7dHS29RfhsLsaIwz3QFyhXrKeDXqbtA", function(error, response, body){
			if (!error && response.statusCode == 200) {
				// parse the jsonData to get the required place reference
				var jsonData = JSON.parse(body);
				var country = jsonData.result.address_components.slice(-1)[0].short_name;
				var photoNum = jsonData.result.photos.length;
				var reference = [];

				// get all the background images url
				for (var i = 0; i < photoNum; i++) {
					reference.push(jsonData.result.photos[i].photo_reference);
					res.locals.url.push("https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photoreference=" + reference[i] + "&key=AIzaSyAX7dHS29RfhsLsaIwz3QFyhXrKeDXqbtA");
				}

				// get weather information
				request("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&appid=fad2c02707d9526deef6c69ef62d538e", function(error, response, body){
					if (!error && response.statusCode == 200) {
						// parse the jsonData to get the required weather information
						var jsonData = JSON.parse(body);
						var temp = k2c(jsonData.main.temp);
						var weather = jsonData.weather[0];
						var sunrise = new Date(jsonData.sys.sunrise*1000);
						var sunset = new Date(jsonData.sys.sunset*1000);
						var sunriseTime = {
							hours: preZero(sunrise.getHours()),
							minutes: preZero(sunrise.getMinutes()),
							seconds: preZero(sunrise.getSeconds())
						}
						var sunsetTime = {
							hours: preZero(sunset.getHours()),
							minutes: preZero(sunset.getMinutes()),
							seconds: preZero(sunset.getSeconds())
						}
						res.render("show", {
							country: country,
							city: city,
							lat: lat,
							lng: lng,
							temp: temp,
							weather: weather,
							sunriseTime: sunriseTime,
							sunsetTime: sunsetTime
						});
					} else {
						req.flash("error", "SOMETHING WENT WRONG WHILE GETTING WEATHER INFORMATION");
						res.redirect("/");
					} // get weather information
				});
			} else {
				req.flash("error", "SOMETHING WENT WRONG WHILE GETTING PHOTOS");
				res.redirect("/");
			} // get place reference
		});
	});
});

app.listen("3000", function(){
	console.log("SERVER HAS STARTED!!!");
});

// Kelvin to Celsius conversion
function k2c(k){
	return parseFloat(k - 272.15).toFixed(0);
}

// prepend a zero to a number and return 2 LSB
function preZero(num) {
	return ("0" + num).slice(-2);
}
