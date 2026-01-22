const apiKey = "07805c8c6ad693510e0551fafa6ff805";
let currentUnit = "metric"; // metric = °C, imperial = °F

// Track last fetched weather source
let lastCity = "";
let lastCoords = null; // {lat, lon}

/* ===============================
   CITY-BASED WEATHER FUNCTION
================================ */
function getWeather() {
  const errorMsg = document.getElementById("errorMessage");
  const loading = document.getElementById("loading");
  const button = document.getElementById("weatherBtn");

  errorMsg.innerText = "";

  let city = document.getElementById("city").value.trim();

  if (city === "") {
    errorMsg.innerText = "Please enter a city name.";
    return;
  }

  lastCity = city;
  lastCoords = null;

  loading.style.display = "block";
  document.body.classList.add("loading");
  button.disabled = true;

  let url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=" +
    apiKey +
    "&units=" + currentUnit;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      loading.style.display = "none";
      document.body.classList.remove("loading");
      button.disabled = false;

      if (data.cod !== 200) {
        errorMsg.innerText =
          "City not found. Please enter a valid city or town name.";
        return;
      }

      saveRecentCity(data.name);
      displayWeatherData(data);
    })
    .catch(error => {
      loading.style.display = "none";
      document.body.classList.remove("loading");
      button.disabled = false;
      errorMsg.innerText =
        "Network error. Please check your internet connection.";
      console.log(error);
    });
}

/* ===============================
   LOCATION-BASED WEATHER FUNCTION
================================ */
function fetchWeatherByCoords(lat, lon) {
  lastCoords = { lat, lon };
  lastCity = "";

  let url =
    "https://api.openweathermap.org/data/2.5/weather?lat=" +
    lat +
    "&lon=" +
    lon +
    "&appid=" +
    apiKey +
    "&units=" + currentUnit;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200) return;

      displayWeatherData(data);
    })
    .catch(error => {
      console.log("Location weather error:", error);
    });
}

/* ===============================
   DISPLAY WEATHER DATA
================================ */
function displayWeatherData(data) {
  document.getElementById("cityName").innerText = "City: " + data.name;
  document.getElementById("temperature").innerText =
    "Temperature: " + data.main.temp + (currentUnit === "metric" ? " °C" : " °F");
  document.getElementById("humidity").innerText =
    "Humidity: " + data.main.humidity + " %";

  // Wind speed conversion
  let windSpeed = data.wind.speed;
  if (currentUnit === "imperial") {
    windSpeed = (windSpeed * 2.237).toFixed(1); // m/s → mph
    document.getElementById("wind").innerText = "Wind Speed: " + windSpeed + " mph";
  } else {
    document.getElementById("wind").innerText = "Wind Speed: " + windSpeed + " m/s";
  }

  document.getElementById("description").innerText =
    "Weather: " + data.weather[0].description;

  document.getElementById("weatherIcon").src =
    "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
}

/* ===============================
   AUTO LOCATION + LOAD RECENTS
================================ */
window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        fetchWeatherByCoords(
          position.coords.latitude,
          position.coords.longitude
        );
      }
    );
  }

  displayRecentCities();
};

/* ===============================
   RECENT SEARCHES
================================ */
function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!cities.includes(city)) {
    cities.unshift(city);
  }

  if (cities.length > 5) cities.pop();

  localStorage.setItem("recentCities", JSON.stringify(cities));
  displayRecentCities();
}

function displayRecentCities() {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  let list = document.getElementById("recentList");

  list.innerHTML = "";

  cities.forEach(city => {
    let li = document.createElement("li");
    li.innerText = city;
    li.style.cursor = "pointer";

    li.onclick = function () {
      document.getElementById("city").value = city;
      getWeather();
    };

    list.appendChild(li);
  });
}

/* ===============================
   UNIT TOGGLE
================================ */
function toggleUnit() {
  const unitBtn = document.getElementById("unitBtn");

  if (currentUnit === "metric") {
    currentUnit = "imperial";
    unitBtn.innerText = "Show °C";
  } else {
    currentUnit = "metric";
    unitBtn.innerText = "Show °F";
  }

  if (lastCity !== "") {
    getWeather();
  } else if (lastCoords) {
    fetchWeatherByCoords(lastCoords.lat, lastCoords.lon);
  }
}
