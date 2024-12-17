// Object to relate state names to their abbreviations (used for handling US states in location input)
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

// API key for accessing the OpenWeatherMap API
const apiKey = config.apiKey;

// Input field for user to enter a city/location name
const locationInput = document.getElementById("locationInput");

// List element for showing city suggestions (based on user input)
const suggestionsList = document.getElementById("citySuggestions");

// Variable to store the latest weather data fetched from the API
let latestWeatherData = null;

// Event listener for handling user input in the location field
locationInput.addEventListener("input", function () {
	const query = locationInput.value.trim(); // Trim whitespace from the input
	if (query.length > 2) { 
		// Fetch city suggestions if the input is longer than 2 characters
		fetchCitySuggestions(query);
	}
});

// Fetches city suggestions from the OpenWeatherMap API
function fetchCitySuggestions(query) {
	const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;

	// Call the API and handle the response
	fetch(geocodingApiUrl)
		.then(response => response.json())
		.then(data => {
			// Populate suggestions based on API response
			populateCitySuggestions(data);
		})
		.catch(error => {
			console.error("Error fetching city suggestions:", error); // Log errors if any
		});
}

// Updates the city suggestions dropdown based on API data
function populateCitySuggestions(cities) {
	suggestionsList.innerHTML = ""; // Clear previous suggestions

	// Iterate over the city data and create options for each city
	cities.forEach(city => {
		const state = city.state ? `, ${city.state}` : ""; // Add state if available
		const option = document.createElement("option");
		option.value = `${city.name}${state}, ${city.country}`; // Format the value
		suggestionsList.appendChild(option); // Append to the suggestions list
	});
}

// Event listener for the "Search" button to fetch weather for the entered location
document.getElementById("searchButton").addEventListener("click", function() {
	const location = document.getElementById("locationInput").value; // Get user input
	if (location) {
		fetchWeather(location); // Fetch weather for the input location
	} else {
		alert("Please enter a city name!"); // Show an alert if the input is empty
	}
});

// Fetches weather data for the given location using OpenWeatherMap API
function fetchWeather(location) {
	const locationParts = location.split(","); // Split input into parts
	let city = locationParts[0].trim();
	let countryOrState = locationParts[1] ? locationParts[1].trim() : "";
	let country = locationParts[2] ? locationParts[2].trim() : "";

	// Map state names to their abbreviations if applicable
	if (countryOrState && stateAbbreviations[countryOrState]) {
		countryOrState = stateAbbreviations[countryOrState];
	}

	// Build the API URL
	let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}`;
	if (countryOrState) {
		apiUrl += `,${countryOrState}`;
	}
	if (country) {
		apiUrl += `,${country}`;
	}

	apiUrl += `&appid=${apiKey}&units=imperial` // Add API key and units (imperial)

	// Fetch weather data from the API
	fetch(apiUrl)
		.then(response => {
			if (!response.ok) {
				throw new Error("Location not found"); // Handle API errors
			}
			return response.json();
		})
		.then(data => {
			latestWeatherData = data; // Store fetched data
			updateWeatherDisplay(latestWeatherData, "imperial"); // Update the weather display
		})
		.catch(error => {
			document.getElementById("weatherInfo").textContent = error.message; // Show error message
		});
}

// Event listener for toggling temperature and speed units (imperial/metric)
document.getElementById("unitToggle").addEventListener("click", function () {
	if (latestWeatherData) {
	  	const unit = this.checked ? "metric" : "imperial"; // Check toggle state
	  	updateWeatherDisplay(latestWeatherData, unit); // Update the display with the selected unit
	}
});

// Updates the weather display on the webpage
function updateWeatherDisplay(data, unit) {
	const tempUnit = unit === "metric" ? "°C" : "°F"; // Determine temperature unit
  	const speedUnit = unit === "metric" ? "m/s" : "mph"; // Determine speed unit
	const temp = unit === "metric" ? (((data.main.temp - 32) * 5) / 9) : data.main.temp; // Convert temperature if needed
	const windSpeed = unit === "metric" ? (data.wind.speed * 0.44704) : data.wind.speed; // Convert wind speed if needed

	// Create weather information string
	const weatherInfo = `
		<h2>${data.name}, ${data.sys.country}</h2>
		<p>Temperature: ${temp.toFixed(1)}${tempUnit}</p>
		<p>Weather: ${data.weather[0].description}</p>
		<p>Humidity: ${data.main.humidity}%</p>
		<p>Wind Speed: ${windSpeed.toFixed(1)} ${speedUnit}</p>
	`;
	document.getElementById("weatherInfo").innerHTML = weatherInfo; // Update the object with weather info
}