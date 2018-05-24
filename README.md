# **WeatherApp**

### This app is used to check the weather condition and view the photos at specified location in no mater what language you use. You can search for:
>- **(TW)** _Taipei, Hsinchu, 石門水庫, 交通大學, 101大樓..._
>- **(JP)** _Tokyo, Kyoto..._
>- **(UK)** _London, Leeds..._
>- **(US)** _New York, California..._

### Get the coordinate and photos of the city using _**Google API**_
1. You need to install the dependency first,
 * ```request``` for making a http request
 * ```node-geocoder``` for using google map API
```
npm install request
npm install node-geocoder
```
2. require node-geocoder and request in index.js
``` js
    var request = require("request");
    var NodeGeocoder = require("node-geocoder");
```
3. setup the options
``` js
    var options = {
        provider: "google",
        httpAdapter: "https",
        apiKey: YOUR_API_KEY,
        formatter: null
    };
```
4. initialize geocoder with the options above
``` js
    var geocoder = NodeGeocoder(options);
```
5. make a request for location information
``` js
    geocoder.geocode(city, function (err, data) {
        if (err || !data.length) {
            error_handler();
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var placeId = data[0].extra.googlePlaceId;
    });
```

6. make a request for location photos
``` js
    request("https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=YOUR_API_KEY", function(error, response, body){
      if (!error && response.statusCode == 200) {
        // parse the jsonData to get the required place reference
        var jsonData = JSON.parse(body);
        var country = jsonData.result.address_components.slice(-1)[0].short_name;
        var photoNum = jsonData.result.photos.length;
        var reference = [];

        // get all the background images url
        for (var i = 0; i < photoNum; i++) {
          reference.push(jsonData.result.photos[i].photo_reference);
          res.locals.url.push("https://maps.googleapis.com/maps/api/place/photo?maxwidth=2000&photoreference=" + reference[i] + "&key=YOUR_API_KEY");
        }
      }
    });
```
7. We are done with Google API


### Get the weather information using _**OpenWeathermap API**_
You only need to make a http request once you had done with Google API above
``` js
    request("http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&appid=YOUR_API_KEY", function(error, response, body){
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
        }
      });
```

### Project Structure
1. Main program ```index.js``` is located at root directory
2. All ```ejs``` files are located at views directory. To use ejs instead of html, simply add these lines in ```index.js```
``` js
  var express = require("express");
  var app = express();
  app.set("view engine", "ejs");
```
3. All ```stylesheet``` (css files) and ```weather icon``` asset are located at public directory. To access this directory, simply add this line in ```index.js```
``` js
  app.use(express.static("public"));
```
