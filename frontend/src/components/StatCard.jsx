export default function StatCard({ label, value, sub, accent, icon: Icon }) {
  return (
    <div className="card-hover group relative overflow-hidden">
      {/* decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5 group-hover:opacity-10 transition-opacity"
           style={{ background: `radial-gradient(circle at top right, ${accent || '#b5ff2d'}, transparent)` }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-2">{label}</p>
          <p className="stat-number" style={{ color: accent || '#b5ff2d' }}>{value}</p>
          {sub && <p className="font-mono text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-carbon-700 border border-carbon-600">
            <Icon size={18} style={{ color: accent || '#b5ff2d' }} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  )
}
