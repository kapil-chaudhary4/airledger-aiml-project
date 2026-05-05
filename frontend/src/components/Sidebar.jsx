import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Cpu, TrendingUp, FlaskConical, Wind } from 'lucide-react'

const links = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/predict', icon: Cpu,             label: 'Predict AQI' },
  { to: '/forecast',icon: TrendingUp,      label: '7-Day Forecast' },
  { to: '/model',   icon: FlaskConical,    label: 'Model Insights' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col bg-carbon-900 border-r border-carbon-700">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-carbon-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-acid rounded-lg flex items-center justify-center">
            <Wind size={16} className="text-carbon-950" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-bold text-white leading-none">AirLedger</p>
            <p className="font-mono text-[10px] text-gray-500 mt-0.5">Delhi NCR · v1.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        <p className="section-label px-3 py-2 mb-1">Navigation</p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-carbon-700">
        <p className="font-mono text-[10px] text-gray-600 text-center">
          JIIT · B-Tech Sem 4
        </p>
        <p className="font-mono text-[10px] text-gray-700 text-center mt-0.5">
          ML-powered pollution intelligence
        </p>
      </div>
    </aside>
  )
}
