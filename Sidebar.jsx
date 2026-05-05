import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorCard({ message, onRetry }) {
  return (
    <div className="card border-risk/30 bg-risk/5 flex items-start gap-3">
      <AlertTriangle size={18} className="text-risk mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-semibold text-risk">Something went wrong</p>
        <p className="font-mono text-xs text-gray-400 mt-1 break-words">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-acid transition-colors">
            <RefreshCw size={12} /> Retry
          </button>
        )}
      </div>
    </div>
  )
}
