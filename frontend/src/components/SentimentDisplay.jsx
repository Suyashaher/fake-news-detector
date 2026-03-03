import { SmilePlus, Meh, Frown } from 'lucide-react'

/**
 * SentimentDisplay — Shows sentiment analysis result with icon and bars
 */
export default function SentimentDisplay({ sentiment }) {
  if (!sentiment) return null

  const { label, polarity, subjectivity } = sentiment

  const getIcon = () => {
    switch (label) {
      case 'Positive': return <SmilePlus className="w-8 h-8 text-green-400" />
      case 'Negative': return <Frown className="w-8 h-8 text-red-400" />
      default: return <Meh className="w-8 h-8 text-yellow-400" />
    }
  }

  const getLabelColor = () => {
    switch (label) {
      case 'Positive': return 'text-green-400'
      case 'Negative': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  // Normalize polarity from [-1, 1] to [0, 100] for bar width
  const polarityPct = ((polarity + 1) / 2) * 100
  const subjectivityPct = subjectivity * 100

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
        Sentiment Analysis
      </h3>

      <div className="flex items-center gap-3 mb-5">
        {getIcon()}
        <span className={`text-2xl font-bold ${getLabelColor()}`}>{label}</span>
      </div>

      {/* Polarity bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-dark-400 mb-1.5">
          <span>Polarity</span>
          <span>{polarity.toFixed(3)}</span>
        </div>
        <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${polarityPct}%`,
              background: `linear-gradient(90deg, #ef4444, #eab308, #22c55e)`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-dark-500 mt-1">
          <span>Negative</span>
          <span>Neutral</span>
          <span>Positive</span>
        </div>
      </div>

      {/* Subjectivity bar */}
      <div>
        <div className="flex justify-between text-xs text-dark-400 mb-1.5">
          <span>Subjectivity</span>
          <span>{(subjectivity * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-1000 ease-out"
            style={{ width: `${subjectivityPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-dark-500 mt-1">
          <span>Objective</span>
          <span>Subjective</span>
        </div>
      </div>
    </div>
  )
}
