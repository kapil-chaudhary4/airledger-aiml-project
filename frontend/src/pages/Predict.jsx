import { useState } from 'react'
import { api }        from '../services/api'
import AqiGauge      from '../components/AqiGauge'
import PageHeader    from '../components/PageHeader'
import { InlineSpinner } from '../components/Spinner'
import { getRiskBadge }  from '../utils/aqi'
import { Zap, Thermometer, Wind, Droplets, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react'

const PRESETS = {
  Winter: { pm25: 180, pm10: 270, no2: 65, so2: 30, co: 3.5, temperature: 14, humidity: 78, wind_speed: 2.5, rainfall: 0, visibility: 3, month: 12, day_of_week: 1, is_weekend: 0 },
  Summer: { pm25: 55,  pm10: 90,  no2: 35, so2: 12, co: 1.2, temperature: 38, humidity: 35, wind_speed: 8,   rainfall: 0, visibility: 8, month: 5,  day_of_week: 3, is_weekend: 0 },
  Monsoon:{ pm25: 30,  pm10: 52,  no2: 22, so2: 8,  co: 0.8, temperature: 29, humidity: 88, wind_speed: 12,  rainfall: 12, visibility: 5, month: 7, day_of_week: 2, is_weekend: 0 },
}

const DEFAULTS = {
  pm25: 80, pm10: 130, no2: 40, so2: 18, co: 2.0,
  temperature: 25, humidity: 55, wind_speed: 5, rainfall: 0, visibility: 7,
  month: 10, day_of_week: 1, is_weekend: 0,
}

const FIELDS = [
  { key: 'pm25',        label: 'PM2.5',       unit: 'μg/m³', min: 0, max: 500,  step: 1,   icon: '💨' },
  { key: 'pm10',        label: 'PM10',        unit: 'μg/m³', min: 0, max: 600,  step: 1,   icon: '🌫️' },
  { key: 'no2',         label: 'NO₂',         unit: 'μg/m³', min: 0, max: 200,  step: 1,   icon: '🔴' },
  { key: 'so2',         label: 'SO₂',         unit: 'μg/m³', min: 0, max: 100,  step: 0.5, icon: '🟡' },
  { key: 'co',          label: 'CO',          unit: 'mg/m³', min: 0, max: 20,   step: 0.1, icon: '⬛' },
  { key: 'temperature', label: 'Temperature', unit: '°C',    min: -5, max: 50,  step: 0.5, icon: '🌡️' },
  { key: 'humidity',    label: 'Humidity',    unit: '%',     min: 0, max: 100,  step: 1,   icon: '💧' },
  { key: 'wind_speed',  label: 'Wind Speed',  unit: 'km/h',  min: 0, max: 60,   step: 0.5, icon: '🌬️' },
  { key: 'rainfall',    label: 'Rainfall',    unit: 'mm',    min: 0, max: 100,  step: 0.5, icon: '🌧️' },
  { key: 'visibility',  label: 'Visibility',  unit: 'km',    min: 0, max: 25,   step: 0.5, icon: '👁️' },
  { key: 'month',       label: 'Month',       unit: '1-12',  min: 1, max: 12,   step: 1,   icon: '📅' },
  { key: 'day_of_week', label: 'Day of Week', unit: '0=Mon', min: 0, max: 6,    step: 1,   icon: '📆' },
]

export default function Predict() {
  const [form,    setForm]    = useState(DEFAULTS)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  function applyPreset(name) {
    setForm(PRESETS[name])
    setResult(null)
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: parseFloat(val) || 0, is_weekend: key === 'day_of_week' ? (val >= 5 ? 1 : 0) : f.is_weekend }))
  }

  async function handlePredict() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.predict(form)
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const riskStyle = result ? getRiskBadge(result.risk_label) : null

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AQI Prediction"
        subtitle="Enter environmental parameters to predict Air Quality Index using ML models"
      >
        <div className="flex gap-2">
          {Object.keys(PRESETS).map(p => (
            <button key={p} onClick={() => applyPreset(p)} className="btn-ghost text-xs py-1.5 px-3">{p}</button>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Input form */}
        <div className="xl:col-span-3 card">
          <p className="section-label mb-5">Environmental Parameters</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FIELDS.map(({ key, label, unit, min, max, step, icon }) => (
              <div key={key}>
                <label className="block font-mono text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
                  {icon} {label} <span className="text-gray-700">({unit})</span>
                </label>
                <input
                  type="number"
                  min={min} max={max} step={step}
                  value={form[key]}
                  onChange={e => setField(key, e.target.value)}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-risk text-xs font-mono bg-risk/5 border border-risk/20 rounded-lg px-3 py-2">
              <AlertTriangle size={12} /> {error}
            </div>
          )}

          <button
            onClick={handlePredict}
            disabled={loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <><InlineSpinner /> Predicting…</> : <><Zap size={16} /> Predict AQI</>}
          </button>
        </div>

        {/* Result panel */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {result ? (
            <>
              {/* Gauge */}
              <div className="card flex flex-col items-center py-6">
                <p className="section-label mb-4">Predicted AQI</p>
                <AqiGauge aqi={result.aqi} size={220} />
                <span className={`badge mt-4 ${riskStyle.bg}`}>{result.risk_label}</span>
              </div>

              {/* Pollution budget */}
              <div className="card">
                <p className="section-label mb-3">Pollution Budget</p>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-gray-400">AQI {result.pollution_budget.predicted}</span>
                  <span className="text-gray-500">Limit: 100</span>
                </div>
                <div className="h-2 rounded-full bg-carbon-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min((result.aqi / 500) * 100, 100)}%`,
                      background: result.pollution_budget.exceeded ? '#f87171' : '#4ade80',
                      boxShadow: result.pollution_budget.exceeded ? '0 0 8px #f8717188' : '0 0 8px #4ade8088'
                    }}
                  />
                </div>
                {result.pollution_budget.exceeded ? (
                  <p className="font-mono text-xs text-risk mt-2 flex items-center gap-1">
                    <AlertTriangle size={10} /> Overshoot by {result.pollution_budget.overshoot} AQI units
                  </p>
                ) : (
                  <p className="font-mono text-xs text-safe mt-2 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Within safe limit ✓
                  </p>
                )}
              </div>

              {/* Risk probabilities */}
              <div className="card">
                <p className="section-label mb-3">Risk Probabilities</p>
                {Object.entries(result.risk_probabilities).map(([label, pct]) => {
                  const colors = { Safe: '#4ade80', Moderate: '#fbbf24', 'High Risk': '#f87171' }
                  return (
                    <div key={label} className="mb-3">
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-gray-400">{label}</span>
                        <span style={{ color: colors[label] }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-carbon-700">
                        <div className="h-full rounded-full transition-all duration-700"
                             style={{ width: `${pct}%`, background: colors[label] }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Recommendations */}
              <div className="card">
                <p className="section-label mb-3">Recommendations</p>
                <div className="space-y-2">
                  {result.recommendations.map((r, i) => {
                    const pColors = { High: 'text-risk', Medium: 'text-warn', Low: 'text-sky', Info: 'text-safe' }
                    return (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-carbon-900 border border-carbon-700">
                        <span className="text-base leading-none mt-0.5">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-xs text-gray-300 leading-snug">{r.action}</p>
                          <span className={`font-mono text-[10px] ${pColors[r.priority] || 'text-gray-500'}`}>{r.priority}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="card flex-1 flex flex-col items-center justify-center py-20 border-dashed">
              <div className="w-16 h-16 rounded-full bg-carbon-700 flex items-center justify-center mb-4">
                <Zap size={24} className="text-gray-500" />
              </div>
              <p className="font-display text-sm text-gray-500 text-center">
                Fill the parameters and click<br /><span className="text-acid">Predict AQI</span> to see results
              </p>
              <p className="font-mono text-xs text-gray-600 mt-2">
                or select a season preset →
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
