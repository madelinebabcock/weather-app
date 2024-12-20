const stateAbbreviations = {
	"Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
	"California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
	"Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
	"Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
	"Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
	"Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
	"Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
	"New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
	"North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
	"Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
	"South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
	"Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
	"Wisconsin": "WI", "Wyoming": "WY"
};

const apiKey = "a70093423265d596e6cd4f26eb30f739";
const locationInput = document.getElementById("locationInput");
const suggestionsList = document.getElementById("citySuggestions");
let latestWeatherData = null;

locationInput.addEventListener("input", function () {
	const query = locationInput.value.trim();
	if (query.length > 2) { 
		fetchCitySuggestions(query);
	}
});

function fetchCitySuggestions(query) {
	const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

	fetch(geocodingApiUrl)
		.then(response => response.json())
		.then(data => {
			populateCitySuggestions(data);
		})
		.catch(error => {
			console.error("Error fetching city suggestions:", error);
		});
}

function populateCitySuggestions(cities) {
	suggestionsList.innerHTML = "";

	cities.forEach(city => {
		const state = city.state ? `, ${city.state}` : "";
		const option = document.createElement("option");
		option.value = `${city.name}${state}, ${city.country}`;
		suggestionsList.appendChild(option);
	});
}

document.getElementById("searchButton").addEventListener("click", function() {
	const location = document.getElementById("locationInput").value;
	if (location) {
		fetchWeather(location);
	} else {
		alert("Please enter a city name!");
	}
});
  
function fetchWeather(location) {
	const locationParts = location.split(",");
	let city = locationParts[0].trim();
	let countryOrState = locationParts[1] ? locationParts[1].trim() : "";
	let country = locationParts[2] ? locationParts[2].trim() : "US";

	if (countryOrState && stateAbbreviations[countryOrState]) {
		countryOrState = stateAbbreviations[countryOrState];
	}

	let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}`;
	if (countryOrState) {
		apiUrl += `,${countryOrState}`;
	}
	if (country) {
		apiUrl += `,${country}`;
	}

	apiUrl += `&appid=${apiKey}&units=imperial`

	fetch(apiUrl)
		.then(response => {
			if (!response.ok) {
				throw new Error("Location not found");
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