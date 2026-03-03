import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react'

/**
 * CredibilityScore — Visual trust score gauge
 */
export default function CredibilityScore({ score = 50 }) {
  const getLevel = () => {
    if (score >= 70) return { label: 'High Credibility', color: '#22c55e', icon: <ShieldCheck className="w-6 h-6" /> }
    if (score >= 40) return { label: 'Medium Credibility', color: '#eab308', icon: <ShieldQuestion className="w-6 h-6" /> }
    return { label: 'Low Credibility', color: '#ef4444', icon: <ShieldAlert className="w-6 h-6" /> }
  }

  const { label, color, icon } = getLevel()

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
        Source Credibility
      </h3>

      <div className="flex items-center gap-3 mb-4">
        <div style={{ color }}>{icon}</div>
        <div>
          <div className="text-2xl font-bold" style={{ color }}>{score.toFixed(0)}</div>
          <div className="text-xs text-dark-400">{label}</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-3 rounded-full bg-dark-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, #ef4444, #eab308 50%, #22c55e)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-dark-500 mt-1.5">
        <span>Unreliable</span>
        <span>Moderate</span>
        <span>Trustworthy</span>
      </div>
    </div>
  )
}
