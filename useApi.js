export default function Spinner({ size = 'md', label = 'Loading…' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className={`${sz} border-2 border-carbon-600 border-t-acid rounded-full animate-spin`} />
      {label && <p className="font-mono text-xs text-gray-500">{label}</p>}
    </div>
  )
}

export function InlineSpinner({ className = '' }) {
  return (
    <div className={`w-4 h-4 border-2 border-carbon-600 border-t-acid rounded-full animate-spin ${className}`} />
  )
}
