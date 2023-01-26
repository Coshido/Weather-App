import { format, addDays, parseISO } from "https://cdn.skypack.dev/date-fns";

let startDate = format(new Date(), "yyyy-MM-dd");
let endDate = format(addDays(parseISO(startDate), 7), "yyyy-MM-dd");
console.log(startDate, " --- ", endDate);

let cityName = "Bologna";
//const geocodeAPI = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;

let latitude = "44.49";
let longitude = "11.33";
const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;

async function getCoordinates(cityName) {
  const geocodeAPI = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
  let response = await fetch(geocodeAPI);
  let geocodeData = await response.json();
  console.log(geocodeData);
  if (!geocodeData.results) {
    console.log(`No city was found with the name of: ${cityName}`);
  } else {
    console.log(geocodeData.results[0]);
    return geocodeData.results[0];
  }
}

getCoordinates("Bologna").catch(alert);

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
