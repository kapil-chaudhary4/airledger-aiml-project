export const AQI_BANDS = [
  { lo: 0,   hi: 50,  label: 'Good',        color: '#4ade80', tailwind: 'text-safe'  },
  { lo: 51,  hi: 100, label: 'Satisfactory', color: '#a3e635', tailwind: 'text-lime-400' },
  { lo: 101, hi: 200, label: 'Moderate',     color: '#fbbf24', tailwind: 'text-warn'  },
  { lo: 201, hi: 300, label: 'Poor',         color: '#fb923c', tailwind: 'text-orange-400' },
  { lo: 301, hi: 400, label: 'Very Poor',    color: '#f87171', tailwind: 'text-risk'  },
  { lo: 401, hi: 500, label: 'Severe',       color: '#c084fc', tailwind: 'text-purple-400' },
]

export function getAqiBand(aqi) {
  return AQI_BANDS.find(b => aqi >= b.lo && aqi <= b.hi) || AQI_BANDS[AQI_BANDS.length - 1]
}

export function getRiskBadge(risk) {
  const map = {
    'Safe':      { color: '#4ade80', bg: 'bg-safe/10  border-safe/30  text-safe'  },
    'Moderate':  { color: '#fbbf24', bg: 'bg-warn/10  border-warn/30  text-warn'  },
    'High Risk': { color: '#f87171', bg: 'bg-risk/10  border-risk/30  text-risk'  },
  }
  return map[risk] || map['Safe']
}

export function aqiGaugeColor(aqi) {
  if (aqi <= 50)  return '#4ade80'
  if (aqi <= 100) return '#a3e635'
  if (aqi <= 200) return '#fbbf24'
  if (aqi <= 300) return '#fb923c'
  if (aqi <= 400) return '#f87171'
  return '#c084fc'
}
