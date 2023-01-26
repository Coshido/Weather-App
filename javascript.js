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
  const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto&start_date=${startDate}&end_date=${endDate}&current_weather=true`;
  let response = await fetch(weatherAPI);
  let data = await response.json();
  return data;
}

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
  console.log("weather array:", weatherArray);
}
getData("Bologna");

const weatherFactory = (dayDate, weatherCode, tempMin, tempMax) => {
  return { dayDate, weatherCode, tempMin, tempMax };
};
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
