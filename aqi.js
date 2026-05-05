import { useState } from 'react'
import { api }        from '../services/api'
import PageHeader    from '../components/PageHeader'
import CustomTooltip from '../components/CustomTooltip'
import { InlineSpinner } from '../components/Spinner'
import { getAqiBand, getRiskBadge } from '../utils/aqi'
import { CloudSun, RefreshCw } from 'lucide-react'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const DEFAULTS = { month: 10, base_pm25: 80, base_temp: 25, base_humidity: 55, base_wind: 5 }

export default function Forecast() {
  const [form,     setForm]     = useState(DEFAULTS)
  const [forecast, setForecast] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.forecast(form)
      setForecast(res.forecast)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'month',        label: 'Month',      min: 1, max: 12,  step: 1  },
    { key: 'base_pm25',    label: 'Base PM2.5', min: 5, max: 400, step: 5  },
    { key: 'base_temp',    label: 'Temperature',min: 0, max: 48,  step: 1  },
    { key: 'base_humidity',label: 'Humidity',   min: 10,max: 100, step: 5  },
    { key: 'base_wind',    label: 'Wind Speed', min: 0, max: 40,  step: 0.5},
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="7-Day AQI Forecast"
        subtitle="ML-powered seasonal forecast based on baseline atmospheric conditions"
      />

      {/* Controls */}
      <div className="card mb-6">
        <p className="section-label mb-4">Baseline Conditions</p>
        <div className="flex flex-wrap gap-4 items-end">
          {fields.map(({ key, label, min, max, step }) => (
            <div key={key} className="flex-1 min-w-[130px]">
              <label className="block font-mono text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</label>
              <input
                type="number" min={min} max={max} step={step}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
                className="input-field"
              />
            </div>
          ))}
          <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            {loading ? <><InlineSpinner /> Generating…</> : <><CloudSun size={16} /> Generate Forecast</>}
          </button>
        </div>
        {error && <p className="font-mono text-xs text-risk mt-3">{error}</p>}
      </div>

      {forecast ? (
        <>
          {/* Trend chart */}
          <div className="card mb-6">
            <p className="section-label mb-4">7-Day AQI Projection</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={forecast} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fc-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                       tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                       tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip unit=" AQI" />} />
                <ReferenceLine y={100} stroke="#4ade8033" strokeDasharray="4 4"
                               label={{ value: 'Safe limit', fill: '#4ade80', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <ReferenceLine y={300} stroke="#f8717133" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="aqi" stroke="#38bdf8" strokeWidth={2.5}
                      fill="url(#fc-grad)" dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#38bdf8' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Day cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
            {forecast.map((day, i) => {
              const band      = getAqiBand(day.aqi)
              const riskStyle = getRiskBadge(day.risk)
              return (
                <div key={i} className="card-hover flex flex-col items-center gap-2 py-4 text-center"
                     style={{ animationDelay: `${i * 60}ms` }}>
                  <p className="font-mono text-[10px] text-gray-500">{day.date.split(' ')[0]}</p>
                  <p className="font-mono text-[10px] text-gray-600">{day.date.split(' ').slice(1).join(' ')}</p>
                  <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center mt-1"
                       style={{ borderColor: band.color, boxShadow: `0 0 12px ${band.color}44` }}>
                    <span className="font-display font-bold text-sm" style={{ color: band.color }}>
                      {Math.round(day.aqi)}
                    </span>
                  </div>
                  <p className="font-mono text-[10px]" style={{ color: band.color }}>{day.category}</p>
                  <span className={`badge text-[9px] px-1.5 py-0.5 ${riskStyle.bg}`}>{day.risk}</span>
                </div>
              )
            })}
          </div>

          {/* Summary insight */}
          <div className="card mt-4 border-sky/20 bg-sky/5">
            <div className="flex items-start gap-3">
              <RefreshCw size={16} className="text-sky mt-0.5 shrink-0" />
              <div>
                <p className="font-display text-sm font-semibold text-sky mb-1">Forecast Note</p>
                <p className="font-body text-xs text-gray-400 leading-relaxed">
                  This forecast uses your baseline PM2.5, temperature, humidity, and wind speed with seasonal noise modelling.
                  Each day adds ±15 μg/m³ variance. For operational use, integrate real-time CPCB data feeds.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card border-dashed flex flex-col items-center justify-center py-24">
          <CloudSun size={36} className="text-gray-600 mb-4" />
          <p className="font-display text-sm text-gray-500">
            Set baseline conditions and click <span className="text-acid">Generate Forecast</span>
          </p>
        </div>
      )}
    </div>
  )
}
