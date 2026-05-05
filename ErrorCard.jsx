import { aqiGaugeColor, getAqiBand } from '../utils/aqi'

export default function AqiGauge({ aqi, size = 200 }) {
  const band   = getAqiBand(aqi)
  const color  = aqiGaugeColor(aqi)
  const pct    = Math.min(aqi / 500, 1)
  const r      = 72
  const cx     = size / 2
  const cy     = size / 2
  const stroke = 10
  const circumference = Math.PI * r          // half-circle
  const dashOffset    = circumference * (1 - pct)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1e2636"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
        {/* Labels */}
        <text x={cx - r - 2} y={cy + 18} fill="#4b5563" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">0</text>
        <text x={cx + r + 2} y={cy + 18} fill="#4b5563" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">500</text>
        {/* Center */}
        <text x={cx} y={cy - 8}  fill={color} fontSize="34" fontFamily="Syne" fontWeight="800" textAnchor="middle"
              style={{ filter: `drop-shadow(0 0 12px ${color}66)` }}>
          {Math.round(aqi)}
        </text>
        <text x={cx} y={cy + 12} fill="#9ca3af" fontSize="11" fontFamily="DM Sans" textAnchor="middle">{band.label}</text>
      </svg>
    </div>
  )
}
