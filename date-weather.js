const openWeatherBtn = document.getElementById("open-weather");
const closeWeatherBtn = document.getElementById("close-weather");
openWeatherBtn.addEventListener("click", openWeather);
closeWeatherBtn.addEventListener("click", closeWeather);


export function startingDate() {
  //if (!localStorage.getItem("startDate")) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formattedDate = today.toISOString().split("T")[0];

  localStorage.setItem("dayOffset", 0);
  localStorage.setItem("startDate", formattedDate);

  const weather = [];
  const start = new Date(formattedDate);
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    const month = date.getMonth(); // 0 = styczen, 11 = grudzien
    weather.push(generateWeather(i + 1, month));
  }
  localStorage.setItem("weather", JSON.stringify(weather));
  //}
}

function getDateFromStart(n) {
  const start = new Date(localStorage.getItem("startDate"));
  start.setDate(start.getDate() + n);

  const day = start.getDate();
  const month = start.getMonth() + 1;
  const year = start.getFullYear();

  return { day, month, year };
}

function generateWeather(dayNumber, month) {
  // Zakresy pogodowe zalezne od miesiaca (0 = styczen, 11 = grudzien)
  const weatherRanges = [
    { temp: [-5, 3], cloud: [60, 100], sunrise: 7, sunset: 16 }, // styczen
    { temp: [-3, 6], cloud: [50, 100], sunrise: 6, sunset: 17 }, // luty
    { temp: [2, 12], cloud: [40, 90], sunrise: 6, sunset: 19 }, // marzec
    { temp: [5, 17], cloud: [30, 80], sunrise: 5, sunset: 20 }, // kwiecien
    { temp: [10, 21], cloud: [20, 70], sunrise: 5, sunset: 20 }, // maj
    { temp: [15, 26], cloud: [10, 60], sunrise: 4, sunset: 21 }, // czerwiec
    { temp: [18, 30], cloud: [10, 50], sunrise: 5, sunset: 21 }, // lipiec
    { temp: [17, 29], cloud: [15, 60], sunrise: 6, sunset: 20 }, // sierpien
    { temp: [12, 22], cloud: [20, 70], sunrise: 6, sunset: 19 }, // wrzesien
    { temp: [7, 16], cloud: [30, 80], sunrise: 7, sunset: 18 }, // pazdziernik
    { temp: [2, 10], cloud: [40, 90], sunrise: 7, sunset: 16 }, // listopad
    { temp: [-2, 5], cloud: [60, 100], sunrise: 7, sunset: 16 }, // grudzien
  ];

  const range = weatherRanges[month];

  return {
    day: `Dzien ${dayNumber}`,
    temperature: getRandomInt(range.temp[0], range.temp[1]),
    windSpeed: getRandomInt(5, 40),
    cloudCoverage: getRandomInt(range.cloud[0], range.cloud[1]),
    sunrise: range.sunrise,
    sunset: range.sunset,
  };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function nextDay() {
  let offset = parseInt(localStorage.getItem("dayOffset") || "0");
  offset++;
  localStorage.setItem("dayOffset", offset);

  let weather = JSON.parse(localStorage.getItem("weather"));

  weather.shift();

  for (let i = 0; i < weather.length; i++) {
    weather[i].day = `Dzien ${i + 1}`;
  }

  const startDate = new Date(localStorage.getItem("startDate"));
  const nextDate = new Date(startDate);
  nextDate.setDate(nextDate.getDate() + offset + 6);

  const newWeather = generateWeather(7, nextDate.getMonth());
  weather.push(newWeather);

  localStorage.setItem("weather", JSON.stringify(weather));
}


function openWeather() {
  const container = document.getElementById("weather-forecast");
  const list = document.getElementById("forecast-list");

  const weather = JSON.parse(localStorage.getItem("weather"));
  if (!weather || weather.length !== 7) {
    list.innerHTML = "<p>Brak danych pogodowych.</p>";
    container.style.display = "flex";
    return;
  }

  list.innerHTML = "";

  weather.forEach((day, index) => {
    const date = getDateFromStart(index);
    const tile = document.createElement("div");
    tile.className = "min-w-[160px] p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm flex-shrink-0 text-sm text-gray-800";
  
    tile.innerHTML = `
      <div class="font-semibold text-center mb-2">Dzień ${index + 1}</div>
      <div class="text-center text-xs text-gray-600 mb-2">${date.day}.${date.month}.${date.year}</div>
      <div class="text-center">🌡️ <strong>${day.temperature}°C</strong></div>
      <div class="text-center">💨 ${day.windSpeed} km/h</div>
      <div class="text-center">☁️ ${day.cloudCoverage}%</div>
    `;
  
    list.appendChild(tile);
  });

  container.style.display = "flex";
}

function closeWeather() {
  document.getElementById("weather-forecast").style.display = "none";
}
