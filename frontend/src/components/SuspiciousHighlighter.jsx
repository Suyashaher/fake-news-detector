import { AlertTriangle } from 'lucide-react'

/**
 * SuspiciousHighlighter — Highlights suspicious sentences with color-coded scores
 */
export default function SuspiciousHighlighter({ sentences = [] }) {
  if (!sentences || sentences.length === 0) return null

  // Only show sentences with some suspicion
  const notable = sentences.filter(s => s.score > 0)

  if (notable.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
          Suspicious Sentences
        </h3>
        <p className="text-dark-500 text-sm">No suspicious patterns detected.</p>
      </div>
    )
  }

  const getClass = (score) => {
    if (score >= 0.5) return 'suspicious-high'
    if (score >= 0.2) return 'suspicious-medium'
    return 'suspicious-low'
  }

  const getLabel = (score) => {
    if (score >= 0.5) return { text: 'High Risk', color: 'text-red-400' }
    if (score >= 0.2) return { text: 'Medium Risk', color: 'text-yellow-400' }
    return { text: 'Low Risk', color: 'text-green-400' }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
          Suspicious Sentences
        </h3>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {notable.slice(0, 10).map((item, idx) => {
          const level = getLabel(item.score)
          return (
            <div key={idx} className={`${getClass(item.score)} rounded-lg animate-fade-in`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-dark-200 leading-relaxed flex-1">
                  {item.sentence}
                </p>
                <span className={`text-xs font-medium whitespace-nowrap ${level.color}`}>
                  {level.text} ({(item.score * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
