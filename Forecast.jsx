@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; }

  body {
    @apply bg-carbon-950 text-gray-100 font-body;
    margin: 0;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0d1117; }
  ::-webkit-scrollbar-thumb { background: #263042; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #b5ff2d40; }
}

@layer components {
  .card {
    @apply bg-carbon-800 border border-carbon-700 rounded-xl p-5;
  }

  .card-hover {
    @apply card transition-all duration-300 hover:border-acid/30 hover:shadow-lg hover:shadow-acid/5;
  }

  .stat-number {
    @apply font-display text-3xl font-bold tracking-tight;
  }

  .section-label {
    @apply font-mono text-xs text-gray-500 uppercase tracking-widest;
  }

  .badge {
    @apply font-mono text-xs px-2 py-0.5 rounded-full border;
  }

  .btn-primary {
    @apply bg-acid text-carbon-950 font-display font-bold px-6 py-2.5 rounded-lg
           hover:bg-acid-dim transition-all duration-200 active:scale-95;
  }

  .btn-ghost {
    @apply border border-carbon-600 text-gray-300 font-display px-5 py-2 rounded-lg
           hover:border-acid/40 hover:text-acid transition-all duration-200;
  }

  .input-field {
    @apply bg-carbon-900 border border-carbon-600 rounded-lg px-3 py-2 text-sm text-gray-200
           font-mono focus:outline-none focus:border-acid/60 transition-colors w-full
           placeholder:text-gray-600;
  }

  .aqi-good    { @apply text-safe; }
  .aqi-mod     { @apply text-warn; }
  .aqi-poor    { @apply text-ember; }
  .aqi-severe  { @apply text-risk; }

  .nav-link {
    @apply flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-display
           text-gray-400 hover:text-white hover:bg-carbon-700 transition-all duration-200;
  }

  .nav-link.active {
    @apply text-acid bg-acid/10 border border-acid/20;
  }
}

/* Recharts overrides */
.recharts-cartesian-grid-horizontal line,
.recharts-cartesian-grid-vertical line { stroke: #1e2636 !important; }
.recharts-tooltip-wrapper { filter: drop-shadow(0 10px 30px rgba(0,0,0,0.5)); }

/* Spin animation */
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
