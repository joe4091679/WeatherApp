var express = require("express"),
		app = express(),
		request = require("request"),
		bodyParser = require("body-parser"),
		flash = require("connect-flash"),
		getmac = require("getmac"),
		google_key = process.env.GEOCODER_KEY || "AIzaSyCqAG89ckLgquX7gbXkJ6wQjT37R8k7iE8",
		weather_key = process.env.WEATHER_KEY || "fad2c02707d9526deef6c69ef62d538e",
		getPhotoReferenceByLocationURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=" + google_key + "&location=",
		getPhotoReferenceByPlaceIdURL = "https://maps.googleapis.com/maps/api/place/details/json?key=" + google_key + "&placeid=",
		getPhotosByPhotoReferenceURL = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&key=" + google_key + "&photoreference=",
		getWeatherInformationURL = "http://api.openweathermap.org/data/2.5/weather?appid=" + weather_key + "&lat=",
		geolocation = require("google-geolocation")({key: google_key});
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: google_key,
  formatter: null
};

var geocoder = NodeGeocoder(options);

//======================================================================
//						CHECK LIST
//======================================================================
console.log("CHECK LIST:")
console.log("	GEOCODER_KEY: " + google_key);
console.log("	WEATHER_KEY: " + weather_key);
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
// middleware
app.use(function (req, res, next) {
		res.locals.language = "English";
  	res.locals.url = [];
  	res.locals.isInLanding = false;
  	res.locals.error = req.flash("error");
  	next();
})
//======================================================================
//							INDEX ROUTE (Landing page)
//======================================================================
app.get("/", function(req, res){
	res.render("landing", {isInLanding: true});
});


//======================================================================
//							SHOW ROUTE
//======================================================================
// show the weather condition of current user's position
app.get("/myLocation", function(req, res){
	// locate user using MAC address
	geolocation(getMacAddress(), function(err, data){
		if (err) {
			req.flash("error", "Error! Can't find you by your MAC address!");
			res.redirect("back");
		} else {
			var lat = data.location.lat;
			var lng = data.location.lng;
			var location = [lat, lng];
			// get photo_reference of locations by location
			request(getPhotoReferenceByLocationURL + location + "&radius=100", function(error, response, body){
				if (err) {
					req.flash("error", "Error! Can't get photos by location!");
					res.redirect("back");
				} else {
					var jsonData = JSON.parse(body);
					var country = "";
					var city = jsonData.results[0].name;
					getPhotos(jsonData, "myLocation", res);
					getWeatherInformation(lat, lng, country, city, res);
				}
			});
		}
	})
});

app.get("/city", function(req, res){
	var city = req.query.city;
	// eval(require("locus"));
	geocoder.geocode(city, function (err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var placeId = data[0].extra.googlePlaceId;
		// get photos_reference of locations by placeId
		request(getPhotoReferenceByPlaceIdURL + placeId, function(error, response, body){
			if (!error && response.statusCode == 200) {
				// parse the jsonData to get the required place reference
				var jsonData = JSON.parse(body);
				// console.log(jsonData);
				if (jsonData.status === 'OK') {
					var country = jsonData.result.address_components.slice(-1)[0].short_name;
					getPhotos(jsonData, "city", res);
					getWeatherInformation(lat, lng, country, city, res);
				} else {
					req.flash("error", jsonData.status);
					res.redirect("back");
				} // status is not 'OK'
			} else {
				req.flash("error", body.error_message);
				res.redirect("/");
			} // get place reference
		});
	});
});



// app.listen(process.env.PORT, process.env.IP, function(){
app.listen("3000", function(){
	console.log("SERVER HAS STARTED!!!");
});

// get photos of location
function getPhotos(jsonData, route, res){
	var photoNum;
	switch (route) {
		case "city":
			if (typeof jsonData.result.photos !== 'undefined') {
				photoNum = jsonData.result.photos.length;
			}
			break;
		case "myLocation":
			photoNum = jsonData.results.length;
			break;
		default:
			break;
	}


	// get all the background images url
	for (var i = 0; i < photoNum; i++) {
		switch (route) {
			case "city":
				res.locals.url.push(getPhotosByPhotoReferenceURL + jsonData.result.photos[i].photo_reference);
				break;
			case "myLocation":
				if (typeof jsonData.results[i].photos !== 'undefined') {
					res.locals.url.push(getPhotosByPhotoReferenceURL + jsonData.results[i].photos[0].photo_reference);
				}
				break;
			default:
				break;
		}
	}
}
// get Mac address to position the user
function getMacAddress(req){
	getmac.getMac(function(err, mac){
		if (err) {
			req.flash("error", "Error! Can't get MAC address!");
		} else {
			return {macAddress: mac};
		}
	});
}
// get weather information with openWeathermap API
function getWeatherInformation(lat, lng, country, city, res){
	// get weather information
	request(getWeatherInformationURL + lat + "&lon=" + lng, function(error, response, body){
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
			req.flash("error", body.error_message);
			res.redirect("/");
		} // get weather information
	});
}
// Kelvin to Celsius conversion
function k2c(k){
	return parseFloat(k - 272.15).toFixed(0);
}
// prepend a zero to a number and return 2 LSB
function preZero(num) {
	return ("0" + num).slice(-2);
}
