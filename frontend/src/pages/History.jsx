import { useState, useEffect } from 'react'
import api from '../api/axios'
import { History as HistoryIcon, Clock, ChevronLeft, ChevronRight, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

export default function History() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [page])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/predict/history?page=${page}&limit=10`)
      setPredictions(data.predictions)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Prediction History</h1>
          <p className="text-sm text-dark-400">{pagination.total} total analysis results</p>
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center animate-fade-in">
          <HistoryIcon className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-300 mb-2">No predictions yet</h3>
          <p className="text-dark-500 text-sm">Go to the dashboard to analyze your first article.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-up">
          {predictions.map((pred, idx) => (
            <div
              key={pred._id}
              className="glass rounded-xl p-5 hover:border-dark-600 transition-all cursor-pointer"
              onClick={() => setExpanded(expanded === idx ? null : idx)}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {pred.prediction === 'Fake' ? (
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  )}
                  <div>
                    <span className={`font-semibold ${pred.prediction === 'Fake' ? 'text-red-400' : 'text-green-400'}`}>
                      {pred.prediction} News
                    </span>
                    <span className="text-dark-500 text-sm ml-2">
                      {pred.confidence.toFixed(1)}% confidence
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-dark-500">
                  <Clock className="w-3 h-3" />
                  {formatDate(pred.createdAt)}
                </div>
              </div>

              {/* Preview text */}
              <p className="text-sm text-dark-400 line-clamp-2">
                {pred.inputText?.substring(0, 200)}...
              </p>

              {/* Expanded details */}
              {expanded === idx && (
                <div className="mt-4 pt-4 border-t border-dark-700/50 animate-slide-down space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="glass-light rounded-lg p-3">
                      <div className="text-dark-500 text-xs mb-1">Sentiment</div>
                      <div className="text-dark-200 font-medium">{pred.sentiment?.label || 'N/A'}</div>
                    </div>
                    <div className="glass-light rounded-lg p-3">
                      <div className="text-dark-500 text-xs mb-1">Credibility</div>
                      <div className="text-dark-200 font-medium">{pred.credibilityScore?.toFixed(0) || 'N/A'}/100</div>
                    </div>
                    <div className="glass-light rounded-lg p-3">
                      <div className="text-dark-500 text-xs mb-1">Subjectivity</div>
                      <div className="text-dark-200 font-medium">
                        {pred.sentiment?.subjectivity !== undefined ? (pred.sentiment.subjectivity * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="glass-light rounded-lg p-3">
                    <div className="text-dark-500 text-xs mb-2">Full Text</div>
                    <p className="text-sm text-dark-300 max-h-40 overflow-y-auto leading-relaxed">
                      {pred.inputText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-dark-400">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
