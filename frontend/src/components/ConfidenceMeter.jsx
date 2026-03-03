/**
 * ConfidenceMeter — Animated circular gauge showing prediction confidence
 */
export default function ConfidenceMeter({ value = 0, prediction = 'True' }) {
  const isFake = prediction === 'Fake'
  const color = isFake ? '#ef4444' : '#22c55e'
  const bgColor = isFake ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'
  const glowColor = isFake ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'

  // SVG arc calculations
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  const dashOffset = circumference - progress

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ filter: `drop-shadow(0 0 20px ${glowColor})` }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="12"
          />
          {/* Progress arc */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>
            {value.toFixed(1)}%
          </span>
          <span className="text-sm text-dark-400 mt-1">Confidence</span>
        </div>
      </div>

      {/* Prediction badge */}
      <div
        className="px-6 py-2 rounded-full text-lg font-bold tracking-wide"
        style={{ backgroundColor: bgColor, color, border: `1px solid ${color}30` }}
      >
        {isFake ? '⚠ FAKE NEWS' : '✓ TRUE NEWS'}
      </div>
    </div>
  )
}
