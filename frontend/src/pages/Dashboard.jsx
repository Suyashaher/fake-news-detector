import { useState, useEffect } from 'react'
import api from '../api/axios'
import ConfidenceMeter from '../components/ConfidenceMeter'
import FakeRealPieChart from '../components/PieChart'
import SentimentDisplay from '../components/SentimentDisplay'
import CredibilityScore from '../components/CredibilityScore'
import SuspiciousHighlighter from '../components/SuspiciousHighlighter'
import ImageUpload from '../components/ImageUpload'
import { Search, FileText, Sparkles, Loader2, RotateCcw } from 'lucide-react'

export default function Dashboard() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ fake: 0, true: 0 })

  // Fetch user stats on mount
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/predict/history?limit=100')
      const predictions = data.predictions || []
      setStats({
        fake: predictions.filter(p => p.prediction === 'Fake').length,
        true: predictions.filter(p => p.prediction === 'True').length,
      })
    } catch {
      // Silently fail — stats are supplementary
    }
  }

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const { data } = await api.post('/predict', { text })
      setResult(data)

      // Update local stats
      if (data.prediction === 'Fake') {
        setStats(prev => ({ ...prev, fake: prev.fake + 1 }))
      } else {
        setStats(prev => ({ ...prev, true: prev.true + 1 }))
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Make sure the AI service is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setText('')
    setResult(null)
    setError('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="text-center mb-10 animate-fade-in">
        
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
          Fake News <span className="gradient-text">Detector</span>
        </h1>
        <p className="text-dark-400 text-lg max-w-2xl mx-auto">
          Paste any news article and our AI will analyze its authenticity, sentiment, and credibility in seconds.
        </p>
      </div>

      {/* Input section */}
      <div className="glass rounded-2xl p-6 mb-8 glow animate-slide-up">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary-400" />
          <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
            News Article Text
          </h2>
        </div>

        <textarea
          id="news-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full news article text here for analysis..."
          rows={8}
          className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-white placeholder-dark-500 resize-none focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all text-sm leading-relaxed"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-dark-500">
            {text.length.toLocaleString()} characters
          </span>
          <div className="flex gap-2">
            {result && (
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 text-sm font-medium transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <button
              id="analyze-button"
              onClick={handleAnalyze}
              disabled={loading || !text.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze Article
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-down">
            {error}
          </div>
        )}
      </div>

      {/* Results section */}
      {result && (
        <div className="space-y-8 animate-slide-up">
          {/* Top row: Confidence + Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Confidence Meter */}
            <div className="glass rounded-2xl p-8 flex items-center justify-center lg:col-span-1">
              <ConfidenceMeter value={result.confidence} prediction={result.prediction} />
            </div>

            {/* Middle: Sentiment + Credibility */}
            <div className="space-y-6 lg:col-span-1">
              <SentimentDisplay sentiment={result.sentiment} />
              <CredibilityScore score={result.credibilityScore} />
            </div>

            {/* Right: Pie Chart + Image Upload */}
            <div className="space-y-6 lg:col-span-1">
              <FakeRealPieChart fakeCount={stats.fake} trueCount={stats.true} />
              <ImageUpload />
            </div>
          </div>

          {/* Bottom: Suspicious sentences */}
          <SuspiciousHighlighter sentences={result.suspiciousSentences} />
        </div>
      )}

      {/* Empty state — show pie chart and image upload when no results */}
      {!result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <FakeRealPieChart fakeCount={stats.fake} trueCount={stats.true} />
          <ImageUpload />
        </div>
      )}
    </div>
  )
}
