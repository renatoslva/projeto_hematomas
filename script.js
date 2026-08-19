const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const nav = document.getElementById("nav"), menu = document.getElementById("menu");
menu.addEventListener("click", () => nav.classList.toggle("open"));

function tick() { const n = new Date(); clock.textContent = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(n); dateText.textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(n) }
setInterval(tick, 1000); tick();

const chips = [...document.querySelectorAll(".chip")], spots = [...document.querySelectorAll(".spot")], spotSearch = document.getElementById("spotSearch"); let activeZone = "todos";
function filterSpots() { const term = spotSearch.value.toLowerCase(); spots.forEach(s => { const okZone = activeZone === "todos" || (s.dataset.zone || "").includes(activeZone); const okTerm = !term || s.textContent.toLowerCase().includes(term); s.classList.toggle("hidden", !(okZone && okTerm)) }) }
chips.forEach(c => c.addEventListener("click", () => { activeZone = c.dataset.zone; chips.forEach(x => x.setAttribute("aria-pressed", String(x === c))); filterSpots() })); spotSearch.addEventListener("input", filterSpots);

const codes = { 0: ["☀️", "céu limpo"], 1: ["🌤️", "poucas nuvens"], 2: ["⛅", "parcialmente nublado"], 3: ["☁️", "nublado"], 45: ["🌫️", "neblina"], 61: ["🌧️", "chuva"], 63: ["🌧️", "chuva"], 65: ["⛈️", "chuva forte"], 80: ["🌦️", "pancadas"], 95: ["⛈️", "tempestade"] };
function codeInfo(c) { return codes[c] || ["🌡️", "condição não informada"] }

async function loadWeather() {
    const city = cityInput.value.trim(); if (!city) return alert("Digite uma cidade.");
    weatherPlace.textContent = "Buscando..."; weatherGrid.innerHTML = "";
    try {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`).then(r => r.json());
        if (!geo.results?.length) throw new Error("Cidade não encontrada.");
        const loc = geo.results[0], place = `${loc.name}${loc.admin1 ? ", " + loc.admin1 : ""}`;
        const data = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`).then(r => r.json());
        const info = codeInfo(data.current.weather_code);
        weatherPlace.textContent = place;
        weatherNow.textContent = `Agora: ${Math.round(data.current.temperature_2m)}°C · ${info[0]} ${info[1]} · vento ${Math.round(data.current.wind_speed_10m)} km/h`;
        weatherGrid.innerHTML = data.daily.time.map((d, i) => { const inf = codeInfo(data.daily.weather_code[i]); const label = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).format(new Date(d + "T12:00:00")); return `<article class="day"><strong>${label}</strong><div class="weather-code">${inf[0]}</div><div>${inf[1]}</div><div class="temp">${Math.round(data.daily.temperature_2m_min[i])}° / ${Math.round(data.daily.temperature_2m_max[i])}°C</div><small>Chuva ${data.daily.precipitation_probability_max[i] ?? 0}%</small></article>` }).join("");
    } catch (e) { weatherPlace.textContent = "Erro"; weatherNow.textContent = e.message }
}

function score(s) { return Math.round((50 + Number(s.regularMarketChangePercent || 0) * 7) * 10) / 10 }
async function loadStocks() {
    const symbols = stockInput.value.replace(/\s/g, "").toUpperCase(); if (!symbols) return alert("Digite códigos de ações.");
    bestStock.textContent = "Carregando cotações..."; stockGrid.innerHTML = "";
    try {
        const data = await fetch(`https://brapi.dev/api/v2/stocks/quote?symbols=${encodeURIComponent(symbols)}`).then(r => r.json());
        const ranked = (data.results || []).map(s => ({ ...s, score: score(s) })).sort((a, b) => b.score - a.score);
        if (!ranked.length) throw new Error("Nenhuma cotação encontrada.");
        const top = ranked[0]; bestStock.textContent = `Maior pontuação educativa hoje: ${top.symbol}, com ${top.score} pontos. Isso não é recomendação de compra.`;
        stockGrid.innerHTML = ranked.map(s => { const ch = Number(s.regularMarketChangePercent || 0); return `<article class="stock ${s.symbol === top.symbol ? "best" : ""}"><div class="ticker">${s.symbol}</div><div class="muted">${s.shortName || s.longName || "Ativo B3"}</div><div class="price">${money.format(Number(s.regularMarketPrice || 0))}</div><div class="${ch >= 0 ? "up" : "down"}">${ch.toFixed(2)}%</div><span class="pill">Pontuação ${s.score}</span></article>` }).join("");
    } catch (e) { bestStock.textContent = e.message }
}

const key = "henatomna.plan.v1";
function n(id) { return Number(document.getElementById(id).value || 0) }
function renderPlan() { const p = JSON.parse(localStorage.getItem(key) || '{"transport":0,"food":0,"extra":0}'); transport.value = p.transport || ""; food.value = p.food || ""; extra.value = p.extra || ""; mTransport.textContent = money.format(p.transport || 0); mFood.textContent = money.format(p.food || 0); mExtra.textContent = money.format(p.extra || 0); mTotal.textContent = money.format((p.transport || 0) + (p.food || 0) + (p.extra || 0)) }
savePlan.addEventListener("click", () => { localStorage.setItem(key, JSON.stringify({ transport: n("transport"), food: n("food"), extra: n("extra") })); renderPlan() });
weatherBtn.addEventListener("click", loadWeather); stockBtn.addEventListener("click", loadStocks);
renderPlan(); loadWeather(); loadStocks();