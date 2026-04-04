const express = require('express');
const router = express.Router();

// ─── Zone coordinates for API lookups ─────────────────────────────
const ZONE_CONFIG = {
  Chennai:   { lat: 13.0827, lon: 80.2707, historicalRisk: 'high',     historicalAdj: 10 },
  Mumbai:    { lat: 19.0760, lon: 72.8777, historicalRisk: 'high',     historicalAdj: 10 },
  Delhi:     { lat: 28.7041, lon: 77.1025, historicalRisk: 'high',     historicalAdj: 10 },
  Bengaluru: { lat: 12.9716, lon: 77.5946, historicalRisk: 'low',      historicalAdj: -5 },
  Hyderabad: { lat: 17.3850, lon: 78.4867, historicalRisk: 'moderate', historicalAdj: 0  },
};

// ─── Base premium ─────────────────────────────────────────────────
const BASE_PREMIUM = 40;

// ─── Mock fallback data (used when APIs are unavailable) ──────────
const MOCK_CONDITIONS = {
  Chennai:   { temp: 38, rain: 0,  humidity: 78, aqi: 89,  desc: 'partly cloudy'  },
  Mumbai:    { temp: 35, rain: 2,  humidity: 85, aqi: 135, desc: 'hazy'            },
  Delhi:     { temp: 41, rain: 0,  humidity: 30, aqi: 245, desc: 'clear sky'       },
  Bengaluru: { temp: 29, rain: 0,  humidity: 65, aqi: 62,  desc: 'clear sky'       },
  Hyderabad: { temp: 36, rain: 0,  humidity: 50, aqi: 110, desc: 'partly cloudy'   },
};

// ─── Fetch live weather from OpenWeatherMap ────────────────────────
async function fetchWeather(lat, lon, zone) {
  if (!process.env.OPENWEATHER_API_KEY) {
    const mock = MOCK_CONDITIONS[zone] || MOCK_CONDITIONS.Chennai;
    return { ...mock, source: 'mock' };
  }
  try {
    const url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat +
                '&lon=' + lon + '&appid=' + process.env.OPENWEATHER_API_KEY + '&units=metric';
    const res = await fetch(url);
    const d = await res.json();
    if (d.cod === 200) {
      return {
        temp: parseFloat((d.main?.temp || 32).toFixed(1)),
        rain: d.rain?.['1h'] || d.rain?.['3h'] || 0,
        humidity: d.main?.humidity || 70,
        desc: d.weather?.[0]?.description || 'clear',
        source: 'OpenWeatherMap (live)',
      };
    }
    throw new Error(d.message || 'API error');
  } catch (err) {
    const mock = MOCK_CONDITIONS[zone] || MOCK_CONDITIONS.Chennai;
    return { ...mock, source: 'mock (API error: ' + err.message + ')' };
  }
}

// ─── Fetch AQI from OpenAQ (free, no key needed) ──────────────────
async function fetchAQI(lat, lon, zone) {
  try {
    // OpenAQ v3 — nearest station, no key required
    const url = 'https://api.openaq.org/v3/locations?coordinates=' + lat + ',' + lon +
                '&radius=25000&limit=1&parameters_id=2'; // pm25 parameter id = 2
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(5000) });
    const d = await res.json();
    if (d.results && d.results.length > 0) {
      const loc = d.results[0];
      const pm25Sensor = loc.sensors?.find(s => s.parameter?.name === 'pm25');
      if (pm25Sensor && pm25Sensor.latest?.value) {
        // Convert PM2.5 µg/m³ to US AQI (approximation)
        const pm25 = parseFloat(pm25Sensor.latest.value);
        const aqi = pm25ToAQI(pm25);
        return { aqi, pm25, station: loc.name, source: 'OpenAQ (live)' };
      }
    }
    throw new Error('No nearby stations');
  } catch {
    // Fallback to mock
    const mock = MOCK_CONDITIONS[zone] || MOCK_CONDITIONS.Chennai;
    return { aqi: mock.aqi, pm25: null, station: zone + ' (estimated)', source: 'mock' };
  }
}

// ─── PM2.5 to AQI conversion (US EPA formula) ─────────────────────
function pm25ToAQI(pm25) {
  const breakpoints = [
    { pmLow: 0,     pmHigh: 12.0,  aqiLow: 0,   aqiHigh: 50  },
    { pmLow: 12.1,  pmHigh: 35.4,  aqiLow: 51,  aqiHigh: 100 },
    { pmLow: 35.5,  pmHigh: 55.4,  aqiLow: 101, aqiHigh: 150 },
    { pmLow: 55.5,  pmHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
    { pmLow: 150.5, pmHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
    { pmLow: 250.5, pmHigh: 500.4, aqiLow: 301, aqiHigh: 500 },
  ];
  for (const bp of breakpoints) {
    if (pm25 <= bp.pmHigh) {
      return Math.round(((bp.aqiHigh - bp.aqiLow) / (bp.pmHigh - bp.pmLow)) * (pm25 - bp.pmLow) + bp.aqiLow);
    }
  }
  return 500;
}

// ─── Build premium breakdown from conditions ───────────────────────
function buildPremium(zone, weather, aqiData) {
  const zoneConf = ZONE_CONFIG[zone] || ZONE_CONFIG.Chennai;
  const components = [];

  // Base
  components.push({
    name: 'Base Premium',
    amount: BASE_PREMIUM,
    direction: 'base',
    reason: 'Standard GigShield base rate for all gig workers',
    icon: '🛡️',
  });

  // Rain adjustment
  const rainAdj = weather.rain > 10 ? 10 : 0;
  components.push({
    name: 'Monsoon Risk',
    amount: rainAdj,
    direction: rainAdj > 0 ? 'up' : 'neutral',
    reason: weather.rain > 10
      ? 'Rainfall ' + weather.rain + 'mm/hr > 10mm threshold → high disruption risk'
      : 'Rainfall ' + weather.rain + 'mm/hr ≤ 10mm → no monsoon surcharge',
    dataPoint: weather.rain + 'mm/hr rainfall',
    icon: '🌧️',
    threshold: '> 10mm/hr → +₹10',
  });

  // Temp adjustment
  const heatAdj = weather.temp > 40 ? 5 : 0;
  components.push({
    name: 'Heat Risk',
    amount: heatAdj,
    direction: heatAdj > 0 ? 'up' : 'neutral',
    reason: weather.temp > 40
      ? 'Temp ' + weather.temp + '°C > 40°C → extreme heat risk for riders'
      : 'Temp ' + weather.temp + '°C ≤ 40°C → no heat surcharge',
    dataPoint: weather.temp + '°C temperature',
    icon: '🌡️',
    threshold: '> 40°C → +₹5',
  });

  // AQI adjustment
  const aqiAdj = aqiData.aqi > 200 ? 8 : 0;
  components.push({
    name: 'Air Quality Risk',
    amount: aqiAdj,
    direction: aqiAdj > 0 ? 'up' : 'neutral',
    reason: aqiData.aqi > 200
      ? 'AQI ' + aqiData.aqi + ' > 200 → unhealthy air increases health claims'
      : 'AQI ' + aqiData.aqi + ' ≤ 200 → acceptable air quality',
    dataPoint: 'AQI ' + aqiData.aqi,
    icon: '💨',
    threshold: '> 200 → +₹8',
  });

  // Historical zone adjustment
  components.push({
    name: 'Zone History',
    amount: zoneConf.historicalAdj,
    direction: zoneConf.historicalAdj > 0 ? 'up' : zoneConf.historicalAdj < 0 ? 'down' : 'neutral',
    reason: zone + ' historical risk: ' + zoneConf.historicalRisk +
      (zoneConf.historicalAdj > 0 ? ' → high past claim rate' : zoneConf.historicalAdj < 0 ? ' → low claim history' : ' → average claim rate'),
    dataPoint: zoneConf.historicalRisk + ' risk zone',
    icon: '📊',
    threshold: 'Low → -₹5 | High → +₹10',
  });

  const total = components.reduce((sum, c) => sum + c.amount, 0);

  // Insurance metrics
  const WORKERS_IN_ZONE = 231;
  const weeklyPremiumPool = total * WORKERS_IN_ZONE;
  const avgPayoutPerEvent = 375; // avg of 4 policies
  const expectedEventFreq = zoneConf.historicalRisk === 'high' ? 0.3 : zoneConf.historicalRisk === 'moderate' ? 0.15 : 0.08;
  const expectedPayoutLiability = Math.round(avgPayoutPerEvent * WORKERS_IN_ZONE * expectedEventFreq);
  const lossRatio = Math.round((expectedPayoutLiability / weeklyPremiumPool) * 100);

  // One-line explanation
  const dominantFactor = components.slice(1).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0];
  let explanation = 'Base ₹40';
  if (dominantFactor && dominantFactor.amount !== 0) {
    explanation += ' · ' + (dominantFactor.amount > 0 ? '+₹' + dominantFactor.amount + ' for ' + dominantFactor.name.toLowerCase() : '-₹' + Math.abs(dominantFactor.amount) + ' for ' + dominantFactor.name.toLowerCase());
  }
  if (total === BASE_PREMIUM) explanation += ' · No active risk surcharges';

  return {
    zone,
    total,
    components,
    weather,
    aqi: aqiData,
    metrics: {
      workersInZone: WORKERS_IN_ZONE,
      weeklyPremiumPool,
      expectedPayoutLiability,
      lossRatio,
      explanation,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// GET /api/premium/calculate?zone=Chennai
// ─────────────────────────────────────────────────────────────────
router.get('/calculate', async (req, res) => {
  const zone = req.query.zone || 'Chennai';

  if (!ZONE_CONFIG[zone]) {
    return res.status(400).json({
      error: 'Invalid zone. Valid zones: ' + Object.keys(ZONE_CONFIG).join(', '),
    });
  }

  const zoneConf = ZONE_CONFIG[zone];

  // Fetch live data in parallel
  const [weather, aqiData] = await Promise.all([
    fetchWeather(zoneConf.lat, zoneConf.lon, zone),
    fetchAQI(zoneConf.lat, zoneConf.lon, zone),
  ]);

  const breakdown = buildPremium(zone, weather, aqiData);

  return res.json({ success: true, ...breakdown, timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────────
// GET /api/premium/zones
// Returns all available zones with their base risk profile.
// ─────────────────────────────────────────────────────────────────
router.get('/zones', (req, res) => {
  const zones = Object.entries(ZONE_CONFIG).map(([name, conf]) => ({
    name,
    historicalRisk: conf.historicalRisk,
    historicalAdj: conf.historicalAdj,
  }));
  res.json({ success: true, zones });
});

module.exports = router;
