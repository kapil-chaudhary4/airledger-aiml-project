import { useApi }     from '../hooks/useApi'
import { api }         from '../services/api'
import Spinner         from '../components/Spinner'
import ErrorCard       from '../components/ErrorCard'
import PageHeader      from '../components/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import CustomTooltip   from '../components/CustomTooltip'
import { FlaskConical, Target, Layers, TrendingUp } from 'lucide-react'

const FEAT_COLORS = ['#b5ff2d','#a3e635','#fbbf24','#fb923c','#f87171','#38bdf8','#c084fc','#4ade80','#f472b6','#818cf8','#6ee7b7','#fcd34d','#7dd3fc']

function ConfusionMatrix({ matrix }) {
  const labels = ['Safe', 'Moderate', 'High Risk']
  const max = Math.max(...matrix.flat())
  return (
    <div>
      <p className="section-label mb-4">Confusion Matrix</p>
      {/* Column headers */}
      <div className="flex">
        <div className="w-20" />
        {labels.map(l => (
          <div key={l} className="flex-1 text-center font-mono text-[10px] text-gray-500 pb-2">{l}</div>
        ))}
      </div>
      {matrix.map((row, i) => (
        <div key={i} className="flex items-center mb-1">
          <div className="w-20 font-mono text-[10px] text-gray-500 text-right pr-3">{labels[i]}</div>
          {row.map((val, j) => {
            const intensity = val / max
            const isDiag    = i === j
            return (
              <div key={j} className="flex-1 h-12 flex items-center justify-center mx-0.5 rounded-lg"
                   style={{
                     background: isDiag
                       ? `rgba(181,255,45,${0.1 + intensity * 0.7})`
                       : `rgba(248,113,113,${intensity * 0.5})`,
                     border: isDiag ? '1px solid rgba(181,255,45,0.3)' : '1px solid rgba(248,113,113,0.2)'
                   }}>
                <span className={`font-mono text-sm font-bold ${isDiag ? 'text-acid' : intensity > 0.1 ? 'text-risk' : 'text-gray-600'}`}>
                  {val}
                </span>
              </div>
            )
          })}
        </div>
      ))}
      <p className="font-mono text-[10px] text-gray-600 mt-3 text-center">Predicted →</p>
    </div>
  )
}

export default function ModelInsights() {
  const { data, loading, error, refetch } = useApi(api.modelInfo)

  if (loading) return <Spinner label="Loading model metrics…" />
  if (error)   return <ErrorCard message={error} onRetry={refetch} />

  const { regression, classification, confusion_matrix, feature_importance, features } = data

  // Feature importance chart data
  const fiData = Object.entries(feature_importance || {})
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value: +(value * 100).toFixed(2) }))

  const bestReg   = Object.entries(regression).sort((a, b) => b[1].r2 - a[1].r2)[0]
  const bestClass = Object.entries(classification).sort((a, b) => b[1].accuracy - a[1].accuracy)[0]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Model Insights"
        subtitle="Evaluation metrics, confusion matrix, and feature importance for trained ML models"
      />

      {/* Best model badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card border-acid/20 bg-acid/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-acid/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-acid" />
            </div>
            <div>
              <p className="section-label">Best Regressor</p>
              <p className="font-display font-bold text-white">{bestReg[0]}</p>
              <p className="font-mono text-xs text-acid">R² = {bestReg[1].r2}</p>
            </div>
          </div>
        </div>
        <div className="card border-sky/20 bg-sky/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky/20 flex items-center justify-center">
              <Target size={20} className="text-sky" />
            </div>
            <div>
              <p className="section-label">Best Classifier</p>
              <p className="font-display font-bold text-white">{bestClass[0]}</p>
              <p className="font-mono text-xs text-sky">Accuracy = {(bestClass[1].accuracy * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        {/* Regression table */}
        <div className="card">
          <p className="section-label mb-4"><TrendingUp size={10} className="inline mr-1.5" />Regression Models</p>
          <div className="space-y-4">
            {Object.entries(regression).map(([name, m]) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs text-gray-300">{name}</span>
                  <div className="flex gap-3 font-mono text-[10px]">
                    <span className="text-gray-500">MAE: <span className="text-warn">{m.mae}</span></span>
                    <span className="text-gray-500">RMSE: <span className="text-ember">{m.rmse}</span></span>
                    <span className="text-gray-500">R²: <span className="text-acid">{m.r2}</span></span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-carbon-700">
                  <div className="h-full rounded-full bg-acid transition-all duration-700"
                       style={{ width: `${m.r2 * 100}%`, boxShadow: '0 0 6px rgba(181,255,45,0.5)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classification table */}
        <div className="card">
          <p className="section-label mb-4"><Target size={10} className="inline mr-1.5" />Classification Models</p>
          <div className="space-y-4">
            {Object.entries(classification).map(([name, m]) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs text-gray-300">{name}</span>
                  <span className="font-mono text-xs text-sky">{(m.accuracy * 100).toFixed(2)}% accuracy</span>
                </div>
                <div className="h-1.5 rounded-full bg-carbon-700">
                  <div className="h-full rounded-full bg-sky transition-all duration-700"
                       style={{ width: `${m.accuracy * 100}%`, boxShadow: '0 0 6px rgba(56,189,248,0.5)' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-carbon-700 pt-4">
            <p className="section-label mb-3">Input Features ({features?.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {features?.map((f, i) => (
                <span key={f} className="badge border-carbon-600 text-gray-400 font-mono text-[10px]"
                      style={{ borderColor: FEAT_COLORS[i] + '66', color: FEAT_COLORS[i] }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Feature importance */}
        {fiData.length > 0 && (
          <div className="card">
            <p className="section-label mb-4"><Layers size={10} className="inline mr-1.5" />Feature Importance</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={fiData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                       tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                       tickLine={false} axisLine={false} width={75} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {fiData.map((_, i) => (
                    <Cell key={i} fill={FEAT_COLORS[i % FEAT_COLORS.length]} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Confusion matrix */}
        {confusion_matrix && (
          <div className="card">
            <ConfusionMatrix matrix={confusion_matrix} />
            <div className="mt-4 pt-4 border-t border-carbon-700">
              <p className="font-mono text-[10px] text-gray-500">
                ✅ Diagonal = correct predictions &nbsp;·&nbsp; ❌ Off-diagonal = misclassifications
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
