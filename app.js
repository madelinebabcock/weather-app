const apiKey = "a70093423265d596e6cd4f26eb30f739";
let latestWeatherData = null;

document.getElementById("searchButton").addEventListener("click", function() {
	const city = document.getElementById("cityInput").value;
	if (city) {
		fetchWeather(city);
	} else {
		alert("Please enter a city name!");
	}
});
  
function fetchWeather(city) {
	const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

	fetch(apiUrl)
		.then(response => {
			if (!response.ok) {
				throw new Error("City not found");
			}
			return response.json();
		})
		.then(data => {
			latestWeatherData = data;
			updateWeatherDisplay(latestWeatherData, "imperial");
		})
		.catch(error => {
			document.getElementById("weatherInfo").textContent = error.message;
		});
}

document.getElementById("unitToggle").addEventListener("click", function () {
	if (latestWeatherData) {
	  	const unit = this.checked ? "metric" : "imperial";
	  	updateWeatherDisplay(latestWeatherData, unit);
	}
});

function updateWeatherDisplay(data, unit) {
	const tempUnit = unit === "metric" ? "°C" : "°F";
  	const speedUnit = unit === "metric" ? "m/s" : "mph";
	const temp = unit === "metric" ? (((data.main.temp - 32) * 5) / 9) : data.main.temp;
	const windSpeed = unit === "metric" ? (data.wind.speed * 0.44704) : data.wind.speed;

	const weatherInfo = `
		<h2>${data.name}, ${data.sys.country}</h2>
		<p>Temperature: ${temp.toFixed(1)}${tempUnit}</p>
		<p>Weather: ${data.weather[0].description}</p>
		<p>Humidity: ${data.main.humidity}%</p>
		<p>Wind Speed: ${windSpeed.toFixed(1)} ${speedUnit}</p>
	`;
	document.getElementById("weatherInfo").innerHTML = weatherInfo;
}