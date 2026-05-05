const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'API error')
  }
  return res.json()
}

export const api = {
  health:    ()       => request('/api/health'),
  dashboard: ()       => request('/api/dashboard'),
  modelInfo: ()       => request('/api/model-info'),
  predict:   (body)   => request('/api/predict',  { method: 'POST', body: JSON.stringify(body) }),
  forecast:  (body)   => request('/api/forecast', { method: 'POST', body: JSON.stringify(body) }),
}
