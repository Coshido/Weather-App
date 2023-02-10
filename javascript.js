import { format, addDays, parseISO } from "https://cdn.skypack.dev/date-fns";

let startDate = format(new Date(), "yyyy-MM-dd");
let endDate = format(addDays(parseISO(startDate), 8), "yyyy-MM-dd");

//const geocodeAPI = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
//const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;

async function getCoordinates(cityName) {
  const geocodeAPI = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
  let response = await fetch(geocodeAPI);
  let data = await response.json();
  if (!data.results) {
    console.log(`No city was found with the name of: ${cityName}`);
  } else {
    return data.results[0];
  }
}

async function getWeather(geocodeDataObject) {
  let latitude = geocodeDataObject.latitude;
  let longitude = geocodeDataObject.longitude;
  const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&current_weather=true&timezone=auto&start_date=${startDate}&end_date=${endDate}&current_weather=true`;
  let response = await fetch(weatherAPI);
  let data = await response.json();
  return data;
}

const weatherFactory = (dayDate, weatherCode, tempMin, tempMax) => {
  const weatherCodeConvert = (weatherCode) => {
    let weatherText, weatherIcon;
    switch (weatherCode) {
      case "0":
        weatherText = "Clear Sky";
        weatherIcon = '<i class="fa-solid fa-sun"></i>';
        break;
      case "1":
        weatherText = "Mainly Clear";
        weatherIcon = '<i class="fa-solid fa-sun"></i>';
        break;
      case "2":
        weatherText = "Partly Cloudy";
        weatherIcon = '<i class="fa-solid fa-cloud-sun"></i>';
        break;
      case "3":
        weatherText = "Overcast";
        weatherIcon = '<i class="fa-solid fa-cloud-sun"></i>';
        break;
      case "48":
      case "45":
        weatherText = "Fog";
        weatherIcon = '<i class="fa-solid fa-smog"></i>';
        break;
      case "51":
      case "56":
        weatherText = "Light Drizzle";
        weatherIcon = '<i class="fa-solid fa-cloud-rain"></i>';
        break;
      case "53":
        weatherText = "Moderate Drizzle";
        weatherIcon = '<i class="fa-solid fa-cloud-rain"></i>';
        break;
      case "55":
      case "57":
        weatherText = "Dense Drizzle";
        weatherIcon = '<i class="fa-solid fa-cloud-rain"></i>';
        break;
      case "61":
      case "66":
        weatherText = "Light Rain";
        weatherIcon = '<i class="fa-solid fa-cloud-showers-heavy"></i>';
        break;
      case "63":
        weatherText = "Moderate Rain";
        weatherIcon = '<i class="fa-solid fa-cloud-showers-heavy"></i>';
        break;
      case "65":
      case "67":
        weatherText = "Heavy Rain";
        weatherIcon = '<i class="fa-solid fa-cloud-showers-heavy"></i>';
        break;
      case "77":
        weatherText = "Snow Grains";
        weatherIcon = '<i class="fa-solid fa-snowflake"></i>';
        break;
      case "71":
      case "85":
        weatherText = "Slight Snow Fall";
        weatherIcon = '<i class="fa-solid fa-snowflake"></i>';
        break;
      case "73":
      case "86":
        weatherText = "Moderate Snow Fall";
        weatherIcon = '<i class="fa-solid fa-snowflake"></i>';
        break;
      case "75":
        weatherText = "Heavy Snow Fall";
        weatherIcon = '<i class="fa-solid fa-snowflake"></i>';
        break;
      case "81":
        weatherText = "Light Rain Shower";
        weatherIcon = '<i class="fa-solid fa-cloud-sun-rain"></i>';
        break;
      case "83":
        weatherText = "Moderate Rain Shower";
        weatherIcon = '<i class="fa-solid fa-cloud-sun-rain"></i>';
        break;
      case "85":
        weatherText = "Heavy Rain Shower";
        weatherIcon = '<i class="fa-solid fa-cloud-sun-rain"></i>';
        break;
      case "95":
      case "96":
      case "99":
        weatherText = "Thunderstorm";
        weatherIcon = '<i class="fa-solid fa-cloud-bolt"></i>';
        break;
      default:
        break;
    }
    return { weatherText, weatherIcon };
  };

  return { dayDate, weatherCode, tempMin, tempMax, weatherCodeConvert };
};

async function getData(cityName) {
  const geocodeData = await getCoordinates(cityName);
  console.log("geocode:", geocodeData);
  const weatherData = await getWeather(geocodeData);
  console.log("weather:", weatherData);
  let weatherArray = [];
  for (let i = 0; i < 8; i++) {
    let dayDate = weatherData.daily.time[i];
    let weatherCode = weatherData.daily.weathercode[i];
    let tempMin = weatherData.daily.temperature_2m_min[i];
    let temMax = weatherData.daily.temperature_2m_max[i];
    let weather = weatherFactory(dayDate, weatherCode, tempMin, temMax);
    weatherArray.push(weather);
  }
  weatherArray[0].currentTemp = weatherData.current_weather.temperature;
  let currentTime = weatherData.current_weather.time.split("T");
  weatherArray[0].currentTime = currentTime[1];
  weatherArray[0].cityName = cityName;
  weatherArray[0].windSpeed = weatherData.current_weather.windspeed;
  weatherArray[0].precipitation = weatherData.daily.precipitation_sum[0];

  console.log("weather array:", weatherArray);
  render(weatherArray);
}
getData("Venice");

function render(weatherArray) {
  let today = weatherArray.shift();
  renderToday(today);
  let weatherGrid = document.querySelector(".weather-grid");
  weatherGrid.innerHTML = "";
  weatherArray.map((ele) => {
    const card = document.createElement("div");
    card.classList.add("weather-card");

    const dayName = format(parseISO(ele.dayDate), "EEEE");
    const cardDay = document.createElement("p");
    cardDay.classList.add("card-day");
    cardDay.textContent = dayName;

    let weather = ele.weatherCodeConvert(ele.weatherCode.toString());
    let cardWeatherIcon = document.createElement("div");
    cardWeatherIcon.classList.add("card-weather-icon");
    cardWeatherIcon.innerHTML = weather.weatherIcon;

    const cardTempMax = document.createElement("p");
    cardTempMax.classList.add("card-temp-max");
    cardTempMax.textContent = `${ele.tempMax} °C`;

    const cardTempMin = document.createElement("p");
    cardTempMin.classList.add("card-temp-min");
    cardTempMin.textContent = `${ele.tempMin} °C`;

    card.appendChild(cardDay);
    card.appendChild(cardWeatherIcon);
    card.appendChild(cardTempMax);
    card.appendChild(cardTempMin);

    weatherGrid.appendChild(card);
  });
}

function renderToday(weather) {
  const weatherToday = document.querySelector(".weather-today");
  weatherToday.innerHTML = "";

  const todayCityName = document.createElement("p");
  todayCityName.classList.add("city-name");
  todayCityName.textContent =
    weather.cityName.charAt(0).toUpperCase() +
    weather.cityName.slice(1).toLowerCase();

  const dayName = format(parseISO(weather.dayDate), "EEEE");
  const dayDate = format(parseISO(weather.dayDate), "dd-MM-yyyy");
  const todayDay = document.createElement("p");
  todayDay.classList.add("today-day-name");
  todayDay.textContent = `${dayName}, ${dayDate}`;

  const todayTime = document.createElement("p");
  todayTime.classList.add("today-time");
  todayTime.textContent = `Timestamp: ${weather.currentTime}`;

  let todayWeather = weather.weatherCodeConvert(weather.weatherCode.toString());

  const todayIcon = document.createElement("div");
  todayIcon.classList.add("today-icon");
  todayIcon.innerHTML = todayWeather.weatherIcon;

  const todayWeatherText = document.createElement("p");
  todayWeatherText.classList.add("today-weather-text");
  todayWeatherText.textContent = todayWeather.weatherText;

  const todayTemp = document.createElement("p");
  todayTemp.classList.add("today-temp");
  todayTemp.textContent = `${weather.currentTemp} °C`;

  weatherToday.appendChild(todayCityName);
  weatherToday.appendChild(todayDay);
  weatherToday.appendChild(todayTime);
  weatherToday.appendChild(todayIcon);
  weatherToday.appendChild(todayWeatherText);
  weatherToday.appendChild(todayTemp);

  const todayTempMax = document.querySelector("#temp-max");
  todayTempMax.innerHTML = "";
  todayTempMax.textContent = `${weather.tempMax} °C`;

  const todayTempMin = document.querySelector("#temp-min");
  todayTempMin.innerHTML = "";
  todayTempMin.textContent = `${weather.tempMin} °C`;

  const todayPrecipitation = document.querySelector("#precipitation");
  todayPrecipitation.innerHTML = "";
  todayPrecipitation.textContent = `${weather.precipitation} mm`;

  const todayWind = document.querySelector("#wind");
  todayWind.innerHTML = "";
  todayWind.textContent = `${weather.windSpeed} khm/h`;
}

const searchButton = document.querySelector(".fa-magnifying-glass");
const inputText = document.querySelector("#input-text");
searchButton.addEventListener("click", () => {
  let text = inputText.value;
  getData(text);
});
inputText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    getData(inputText.value);
  }
});
//footer

function createFooter() {
  let footer = document.createElement("footer");
  let footerLink = document.createElement("a");
  footerLink.classList.add("footer-link");
  footerLink.href = "https://github.com/Coshido?tab=repositories";
  footerLink.target = "_blank";
  footerLink.innerHTML = `Copyrights © 2022 Coshido  <i class="fab fa-github"></i>`;
  footer.appendChild(footerLink);

  return footer;
}
const footer = createFooter();
document.querySelector("body").appendChild(footer);
