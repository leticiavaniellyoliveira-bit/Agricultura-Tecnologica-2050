const areaInput = document.getElementById('area-input');
const depthInput = document.getElementById('depth-input');
const calcButton = document.getElementById('calc-button');
const calcResult = document.getElementById('calc-result');
const coordInput = document.getElementById('coordInput');
const btnSuggest = document.getElementById('btnSuggest');
const weatherInfo = document.getElementById('weatherInfo');
const soilInfo = document.getElementById('soilInfo');
const tempInfo = document.getElementById('tempInfo');
const alertsList = document.getElementById('alertsList');
const suggestionPanel = document.getElementById('suggestionPanel');
const usageWater = document.getElementById('usageWater');
const efficiency = document.getElementById('efficiency');
const carbon = document.getElementById('carbon');

let coords = parseCoords(coordInput.value);
let soilMoisture = 55;

const tempChart = createLineChart('tempChart', 'Temperatura (°C)');
const moistureChart = createLineChart('moistureChart', 'Umidade do solo (%)');

const map = L.map('map').setView([coords.lat, coords.lon], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
let marker = L.marker([coords.lat, coords.lon]).addTo(map);

calcButton.addEventListener('click', calculateSubstrate);

async function updateAll() {
  coords = parseCoords(coordInput.value);
  marker.setLatLng([coords.lat, coords.lon]);
  map.setView([coords.lat, coords.lon], map.getZoom());

  const weather = await fetchWeather(coords.lat, coords.lon);
  if (!weather) {
    weatherInfo.innerText = 'Não foi possível carregar o clima.';
    return;
  }

  renderWeather(weather);
  simulateSoil(weather);
  updateCharts(weather);
  updateSustainability();
  updateAlerts(weather);
}

btnSuggest.addEventListener('click', async () => {
  suggestionPanel.innerText = 'Gerando recomendações...';
  const rec = await generateRecommendations(coords, soilMoisture);
  suggestionPanel.innerHTML = formatSuggestions(rec);
});

coordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    updateAll();
  }
});

updateAll();
setInterval(updateAll, 60000);

function calculateSubstrate() {
  const area = parseFloat(areaInput.value);
  const depth = parseFloat(depthInput.value);
  if (!area || area <= 0 || !depth || depth <= 0) {
    calcResult.innerHTML = `
      <h3>⚠️ Erro na entrada</h3>
      <p>Informe uma área e profundidade válidas para calcular.</p>
    `;
    return;
  }

  const volume = (area * depth) / 10;
  const density = 0.65;
  const weight = volume * density;
  const bagCapacity = 40;
  const pricePerBag = 25;
  const bagsNeeded = Math.ceil(volume / bagCapacity);
  const totalCost = bagsNeeded * pricePerBag;

  calcResult.innerHTML = `
    <h3>📦 Resultado do cálculo</h3>
    <div class="calc-result-details">
      <p><strong>Volume total:</strong> ${volume.toFixed(0)} litros</p>
      <p><strong>Peso estimado:</strong> ${weight.toFixed(1)} kg</p>
      <p><strong>Sacos necessários:</strong> ${bagsNeeded} sacos de 40L</p>
      <p><strong>Custo estimado:</strong> R$ ${totalCost.toFixed(2)}</p>
    </div>
    <div class="calc-tip">
      <p>💡 Recomendamos adicionar 10% a mais para segurança e perdas.</p>
    </div>
  `;
}

function parseCoords(value) {
  const parts = value.split(',').map((item) => parseFloat(item.trim()));
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return { lat: parts[0], lon: parts[1] };
  }
  return { lat: -23.5489, lon: -46.6388 };
}

async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation&current_weather=true&forecast_days=3&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

function renderWeather(data) {
  const current = data.current_weather;
  weatherInfo.innerHTML = `Temperatura: <strong>${current.temperature} °C</strong>, vento: <strong>${current.windspeed} m/s</strong>`;
  tempInfo.innerText = `${current.temperature} °C`;
}

function simulateSoil(data) {
  const precipitation = data.hourly?.precipitation?.slice(0, 24).reduce((sum, value) => sum + (value || 0), 0) || 0;
  soilMoisture += precipitation * 1.8;
  soilMoisture -= 1.3;
  soilMoisture = Math.max(8, Math.min(92, soilMoisture));
  soilInfo.innerText = `${soilMoisture.toFixed(1)} %`;
}

function updateCharts(data) {
  const label = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const temperature = data.current_weather.temperature;
  pushPoint(tempChart, label, temperature);
  pushPoint(moistureChart, label, soilMoisture.toFixed(1));
}

function updateSustainability() {
  const waterUse = Math.max(20, (100 - soilMoisture) * 4);
  const efficiencyValue = Math.max(15, Math.min(95, 100 - waterUse / 10));
  usageWater.innerText = `Uso de água: ${waterUse.toFixed(0)} L/ha`;
  efficiency.innerText = `Eficiência hídrica: ${efficiencyValue.toFixed(0)} %`;
  carbon.innerText = `Pegada de carbono: ${(waterUse * 0.02).toFixed(1)} kg CO₂`;
}

function updateAlerts(data) {
  alertsList.innerHTML = '';
  if (soilMoisture < 35) {
    addAlert('Umidade do solo está baixa. Irrigação recomendada.');
  }
  if (data.current_weather.temperature >= 34) {
    addAlert('Temperatura elevada. Cuidado com estresse térmico na cultura.');
  }
  const precip24 = data.hourly?.precipitation?.slice(0, 24).reduce((sum, value) => sum + (value || 0), 0) || 0;
  if (precip24 > 20) {
    addAlert('Previsão de chuva intensa nas próximas 24 horas.');
  }
}

function addAlert(message) {
  const li = document.createElement('li');
  li.innerText = message;
  alertsList.appendChild(li);
}

async function generateRecommendations(coords, soil) {
  const weather = await fetchWeather(coords.lat, coords.lon);
  const temperature = weather?.current_weather?.temperature ?? 22;
  const planting = (temperature >= 16 && temperature <= 30 && soil >= 40 && soil <= 80)
    ? 'Agora é uma boa época para plantio.'
    : 'Aguardar condições para plantio. Considere o início da estação chuvosa.';
  const waterPerDay = Math.max(3, Math.round((60 - soil) / 3));
  const pestControl = temperature > 28
    ? 'Atenção para pragas de clima quente: lagartas, percevejos e ácaros.'
    : 'Risco menor de pragas térmicas no momento.';
  const productivityFactor = (soil / 65) * Math.max(0.6, Math.min(1.1, 30 / temperature));
  const predictedYield = `${Math.round(productivityFactor * 100)}% da produtividade potencial`;
  return {
    planting,
    waterPerDay,
    pestControl,
    predictedYield,
  };
}

function formatSuggestions(rec) {
  return `
    <p><strong>Plantio:</strong> ${rec.planting}</p>
    <p><strong>Água ideal:</strong> ${rec.waterPerDay} mm/dia</p>
    <p><strong>Controle de pragas:</strong> ${rec.pestControl}</p>
    <p><strong>Previsão de produtividade:</strong> ${rec.predictedYield}</p>
  `;
}

function createLineChart(canvasId, label) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label,
        data: [],
        borderColor: '#0b6e4f',
        backgroundColor: 'rgba(11, 110, 79, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          title: { display: true, text: 'Hora' }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function pushPoint(chart, label, value) {
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(value);
  if (chart.data.labels.length > 24) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update('none');
}
