function startingDate() {

  if (!localStorage.getItem("startDate")) {
    const today = new Date();
    localStorage.setItem("dayOffset", "0");
    localStorage.setItem("startDate", today.toISOString());
  }
}

function getDateFromStart(n) {
  const start = new Date(localStorage.getItem("startDate"));
  start.setDate(start.getDate() + n);

  const day = start.getDate();
  const month = start.getMonth() + 1;
  const year = start.getFullYear();

  return { day, month, year };
}

function generateWeather() {
  const weather = [];

  for (let i = 0; i < 7; i++) {
    weather.push({
      day: `Dzień ${i + 1}`,
      temperature: Math.floor(Math.random() * 21) + 5,     // 5–25°C
      windSpeed: Math.floor(Math.random() * 36) + 5,       // 5–40 km/h
      cloudCoverage: Math.floor(Math.random() * 101)       // 0–100%
    });
  }

  return weather;
}

window.onload = () =>{
    for(let i = 0; i < 3; i++){
        console.log(generateWeather());
    }
}