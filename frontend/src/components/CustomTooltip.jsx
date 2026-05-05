export default function CustomTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-carbon-800 border border-carbon-600 rounded-lg p-3 shadow-2xl">
      <p className="font-mono text-[10px] text-gray-500 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="font-mono text-sm font-medium" style={{ color: p.color }}>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{unit}
          </span>
          {p.name && <span className="font-mono text-[10px] text-gray-500">{p.name}</span>}
        </div>
      ))}
    </div>
  )
}
