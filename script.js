/* =========================================
   AETHER WEATHER APP — script.js
   ========================================= */

const API_KEY = 'b6f2e40ea91544ba915195346260306';

let currentData = null;
let useCelsius   = true;

/* ─── Live clock ─────────────────────────── */
function updateClock() {
  const el = document.getElementById('clockEl');
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m}`;
}
setInterval(updateClock, 1000);

/* ─── Particle generators ────────────────── */
function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 1;
    s.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      width:  ${size}px;
      height: ${size}px;
      animation-delay:    ${Math.random() * 4}s;
      animation-duration: ${2 + Math.random() * 3}s;
    `;
    container.appendChild(s);
  }
}

function createRain() {
  const container = document.getElementById('rain');
  for (let i = 0; i < 65; i++) {
    const d = document.createElement('div');
    d.className = 'raindrop';
    const h = Math.random() * 60 + 20;
    d.style.cssText = `
      left:               ${Math.random() * 100}%;
      height:             ${h}px;
      animation-duration: ${0.55 + Math.random() * 0.8}s;
      animation-delay:    ${Math.random() * 2}s;
      opacity:            ${0.3 + Math.random() * 0.5};
    `;
    container.appendChild(d);
  }
}

function createSnow() {
  const container = document.getElementById('snow');
  const flakes = ['❄', '❅', '❆'];
  for (let i = 0; i < 45; i++) {
    const f = document.createElement('div');
    f.className = 'snowflake';
    f.textContent = flakes[Math.floor(Math.random() * 3)];
    f.style.cssText = `
      left:               ${Math.random() * 100}%;
      font-size:          ${8 + Math.random() * 10}px;
      animation-duration: ${4 + Math.random() * 6}s;
      animation-delay:    ${Math.random() * 5}s;
      opacity:            ${0.4 + Math.random() * 0.5};
    `;
    container.appendChild(f);
  }
}

/* ─── Theme / background switcher ───────── */
function applyTheme(condition, isDay) {
  const bg    = document.getElementById('bg');
  const stars = document.getElementById('stars');
  const rain  = document.getElementById('rain');
  const snow  = document.getElementById('snow');

  // Reset all states
  rain.classList.remove('visible');
  snow.classList.remove('visible');
  stars.classList.remove('visible');
  bg.className = 'bg';

  const c = condition.toLowerCase();

  if (!isDay) {
    bg.classList.add('night');
    stars.classList.add('visible');
  } else if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) {
    bg.classList.add('rainy');
    rain.classList.add('visible');
  } else if (c.includes('snow') || c.includes('sleet') || c.includes('blizzard')) {
    bg.classList.add('snowy');
    snow.classList.add('visible');
  } else if (c.includes('cloud') || c.includes('overcast') || c.includes('fog') || c.includes('mist')) {
    bg.classList.add('cloudy');
  } else {
    bg.classList.add('sunny');
  }
}

/* ─── AQI helpers ────────────────────────── */
function getAQIInfo(aqi) {
  const levels = [
    { label: 'Good',               color: '#4caf50', pct: 15 },
    { label: 'Moderate',           color: '#ffeb3b', pct: 33 },
    { label: 'Unhealthy (Sensitive)', color: '#ff9800', pct: 52 },
    { label: 'Unhealthy',          color: '#f44336', pct: 68 },
    { label: 'Very Unhealthy',     color: '#9c27b0', pct: 84 },
    { label: 'Hazardous',          color: '#7b0000', pct: 100 },
  ];
  const idx = Math.min((aqi || 1) - 1, 5);
  return levels[idx];
}

function getUVLabel(uv) {
  if (uv <= 2)  return 'Low';
  if (uv <= 5)  return 'Moderate';
  if (uv <= 7)  return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

/* ─── Render weather data ────────────────── */
function renderWeather(data) {
  currentData = data;

  const loc = data.location;
  const cur = data.current;
  const aqi = cur.air_quality?.['us-epa-index'] || 1;
  const isDay = cur.is_day === 1;
  const condition = cur.condition.text;

  applyTheme(condition, isDay);

  // Temp values
  const temp  = useCelsius ? Math.round(cur.temp_c)       : Math.round(cur.temp_f);
  const feels = useCelsius ? Math.round(cur.feelslike_c)  : Math.round(cur.feelslike_f);
  const dewpt = useCelsius ? cur.dewpoint_c               : cur.dewpoint_f;
  const unit  = useCelsius ? 'C' : 'F';

  // Date/time
  const now    = new Date();
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const aqiInfo = getAQIInfo(aqi);
  const uvLabel = getUVLabel(cur.uv);
  const iconSrc = `https:${cur.condition.icon.replace('64x64', '128x128')}`;

  // Hide loader, show content
  document.getElementById('statusMsg').style.display = 'none';
  const content = document.getElementById('weatherContent');
  content.style.display = 'block';

  content.innerHTML = `
    <!-- Location + time -->
    <div class="loc-row">
      <div>
        <div class="location">${loc.name}</div>
        <div class="country">${loc.region ? loc.region + ', ' : ''}${loc.country}</div>
      </div>
      <div class="time-block">
        <div class="time-val" id="clockEl">${timeStr}</div>
        <div class="date-val">${dateStr}</div>
      </div>
    </div>

    <!-- Big temp + weather icon -->
    <div class="hero-row">
      <div class="temp-giant">${temp}<sup>°${unit}</sup></div>
      <div class="weather-icon-wrap">
        <img src="${iconSrc}" alt="${condition}" />
      </div>
    </div>

    <div class="condition-text">${condition}</div>
    <div class="feels-like">
      Feels like ${feels}°${unit} &nbsp;·&nbsp; Humidity ${cur.humidity}%
    </div>

    <div class="divider"></div>

    <!-- 6-stat grid -->
    <div class="stats">
      <div class="stat-item">
        <div class="stat-icon">💨</div>
        <div class="stat-label">Wind</div>
        <div class="stat-val">${Math.round(cur.wind_kph)} km/h</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">👁️</div>
        <div class="stat-label">Visibility</div>
        <div class="stat-val">${cur.vis_km} km</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">🌡️</div>
        <div class="stat-label">Pressure</div>
        <div class="stat-val">${cur.pressure_mb} mb</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">💧</div>
        <div class="stat-label">Dew Point</div>
        <div class="stat-val">${dewpt}°</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">🧭</div>
        <div class="stat-label">Wind Dir</div>
        <div class="stat-val">${cur.wind_dir}</div>
      </div>
      <div class="stat-item">
        <div class="stat-icon">${isDay ? '☀️' : '🌙'}</div>
        <div class="stat-label">${isDay ? 'Daytime' : 'Nighttime'}</div>
        <div class="stat-val">${cur.cloud}% cloud</div>
      </div>
    </div>

    <!-- AQI bar -->
    <div class="aqi-section">
      <div class="aqi-header">
        <div class="aqi-label">Air Quality Index</div>
        <div class="aqi-badge" style="
          color: ${aqiInfo.color};
          background: ${aqiInfo.color}18;
          border-color: ${aqiInfo.color}30;
        ">${aqiInfo.label}</div>
      </div>
      <div class="aqi-track">
        <div class="aqi-fill" id="aqiFill"
          style="width: 0%; background: ${aqiInfo.color}">
        </div>
      </div>
    </div>

    <!-- UV + Precipitation -->
    <div class="uv-row">
      <div class="mini-card">
        <div class="mini-icon">🌞</div>
        <div>
          <div class="mini-label">UV Index</div>
          <div class="mini-val">UV ${cur.uv} · ${uvLabel}</div>
        </div>
      </div>
      <div class="mini-card">
        <div class="mini-icon">💦</div>
        <div>
          <div class="mini-label">Precipitation</div>
          <div class="mini-val">${cur.precip_mm} mm</div>
        </div>
      </div>
    </div>
  `;

  // Animate AQI bar after DOM settles
  setTimeout(() => {
    const fill = document.getElementById('aqiFill');
    if (fill) fill.style.width = aqiInfo.pct + '%';
  }, 300);
}

/* ─── Fetch weather from API ─────────────── */
async function fetchWeather(city) {
  const input = document.getElementById('cityInput');
  const query = city || input.value.trim() || 'London';

  // Show loader
  const statusMsg = document.getElementById('statusMsg');
  statusMsg.innerHTML = '<div class="loader"></div>Loading weather…';
  statusMsg.style.display = 'block';
  document.getElementById('weatherContent').style.display = 'none';

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(query)}&aqi=yes`;
    const res  = await fetch(url);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || 'City not found');
    }

    const data = await res.json();
    renderWeather(data);

  } catch (e) {
    statusMsg.innerHTML = `
      <div class="error-icon">🌧️</div>
      ${e.message.includes('No matching') || e.message.includes('City not found')
        ? 'City not found. Try another name.'
        : 'Could not load weather. Check your connection.'}
    `;
  }
}

/* ─── Toggle °C / °F ─────────────────────── */
function toggleUnit() {
  useCelsius = !useCelsius;
  document.getElementById('unitToggle').textContent = useCelsius ? '°F' : '°C';
  if (currentData) renderWeather(currentData);
}

/* ─── Enter key on search input ─────────── */
document.getElementById('cityInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchWeather();
});

/* ─── Init ───────────────────────────────── */
createStars();
createRain();
createSnow();
fetchWeather('London');