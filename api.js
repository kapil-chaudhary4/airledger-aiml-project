import { useApi } from '../hooks/useApi'
import { api }    from '../services/api'
import Spinner    from '../components/Spinner'
import ErrorCard  from '../components/ErrorCard'
import StatCard   from '../components/StatCard'
import PageHeader from '../components/PageHeader'
import CustomTooltip from '../components/CustomTooltip'
import { getAqiBand } from '../utils/aqi'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Activity, ShieldCheck, AlertOctagon, TrendingUp, MapPin, BarChart2 } from 'lucide-react'

const MONTH_COLORS = ['#b5ff2d','#a3e635','#fbbf24','#fb923c','#f87171','#c084fc',
                      '#38bdf8','#818cf8','#f472b6','#4ade80','#f59e0b','#60a5fa']

export default function Dashboard() {
  const { data, loading, error, refetch } = useApi(api.dashboard)

  if (loading) return <Spinner label="Fetching dashboard data…" />
  if (error)   return <ErrorCard message={error} onRetry={refetch} />

  const { stats, trend, monthly, by_location, risk_dist } = data

  const avgBand = getAqiBand(stats.avg_aqi)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Pollution Dashboard"
        subtitle={`Overview of Delhi-NCR air quality · ${stats.total_days} observation days`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Activity}
          label="Average AQI"
          value={stats.avg_aqi}
          sub={avgBand.label}
          accent={avgBand.color}
        />
        <StatCard
          icon={TrendingUp}
          label="Peak AQI"
          value={stats.max_aqi}
          sub="Historical maximum"
          accent="#f87171"
        />
        <StatCard
          icon={ShieldCheck}
          label="Safe Days"
          value={stats.safe_days}
          sub={`${((stats.safe_days/stats.total_days)*100).toFixed(1)}% of total`}
          accent="#4ade80"
        />
        <StatCard
          icon={AlertOctagon}
          label="High-Risk Days"
          value={stats.high_risk_days}
          sub={`${((stats.high_risk_days/stats.total_days)*100).toFixed(1)}% of total`}
          accent="#f87171"
        />
      </div>

      {/* Trend + Risk */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        {/* 60-day trend */}
        <div className="card xl:col-span-2">
          <p className="section-label mb-4">60-Day AQI Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqi-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#b5ff2d" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#b5ff2d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                     interval={8} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                     tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip unit=" AQI" />} />
              <Area type="monotone" dataKey="aqi" stroke="#b5ff2d" strokeWidth={2}
                    fill="url(#aqi-grad)" dot={false} activeDot={{ r: 4, fill: '#b5ff2d' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution */}
        <div className="card flex flex-col">
          <p className="section-label mb-4">Risk Distribution</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={risk_dist} dataKey="count" nameKey="label"
                     cx="50%" cy="50%" outerRadius={70} innerRadius={40}
                     paddingAngle={3} strokeWidth={0}>
                  {risk_dist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="bg-carbon-800 border border-carbon-600 rounded-lg p-2 text-xs font-mono">
                      <span style={{ color: payload[0].payload.color }}>{payload[0].payload.label}</span>
                      <span className="text-gray-400 ml-2">{payload[0].value} days</span>
                    </div>
                  ) : null
                } />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {risk_dist.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span className="font-mono text-gray-400">{r.label}</span>
                </div>
                <span className="font-mono font-medium" style={{ color: r.color }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly + Location */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Monthly averages */}
        <div className="card">
          <p className="section-label mb-4">Monthly Average AQI</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                     tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                     tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip unit=" AQI" />} />
              <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
                {monthly.map((_, i) => (
                  <Cell key={i} fill={MONTH_COLORS[i % MONTH_COLORS.length]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location comparison */}
        <div className="card">
          <p className="section-label mb-4">
            <MapPin size={10} className="inline mr-1" />Location Average AQI
          </p>
          <div className="space-y-3">
            {[...by_location].sort((a, b) => b.aqi - a.aqi).map((loc) => {
              const band = getAqiBand(loc.aqi)
              const pct  = (loc.aqi / 500) * 100
              return (
                <div key={loc.location}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs text-gray-300">{loc.location}</span>
                    <span className="font-mono text-xs font-semibold" style={{ color: band.color }}>{loc.aqi}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-carbon-700">
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${pct}%`, background: band.color, boxShadow: `0 0 6px ${band.color}66` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
