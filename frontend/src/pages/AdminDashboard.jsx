import { useState, useEffect } from 'react'
import api from '../api/axios'
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Users, Activity, TrendingUp, BarChart3, Clock, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="glass rounded-2xl p-12 text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Access Denied</h3>
          <p className="text-dark-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const pieData = [
    { name: 'True', value: stats.truePredictions, color: '#22c55e' },
    { name: 'Fake', value: stats.fakePredictions, color: '#ef4444' },
  ]

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-dark-400">System-wide analytics and user management</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={stats.totalUsers}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Total Predictions"
          value={stats.totalPredictions}
          color="text-primary-400"
          bgColor="bg-primary-500/10"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Fake Detected"
          value={stats.fakePredictions}
          color="text-red-400"
          bgColor="bg-red-500/10"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Avg Confidence"
          value={`${stats.averageConfidence}%`}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie chart */}
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
            Overall Distribution
          </h3>
          {stats.totalPredictions > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-dark-500 text-sm">No data</div>
          )}
        </div>

        {/* Daily bar chart */}
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
            Last 7 Days Activity
          </h3>
          {stats.dailyStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => v.substring(5)} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
                />
                <Bar dataKey="trueCount" name="True" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fakeCount" name="Fake" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-dark-500 text-sm">No data in last 7 days</div>
          )}
        </div>
      </div>

      {/* Recent predictions table */}
      <div className="glass rounded-2xl p-6 animate-slide-up">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
          Recent Predictions
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-dark-500 font-medium">User</th>
                <th className="text-left py-3 px-4 text-dark-500 font-medium">Result</th>
                <th className="text-left py-3 px-4 text-dark-500 font-medium">Confidence</th>
                <th className="text-left py-3 px-4 text-dark-500 font-medium">Text Preview</th>
                <th className="text-left py-3 px-4 text-dark-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPredictions?.map((pred) => (
                <tr key={pred._id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="py-3 px-4 text-dark-300">{pred.user?.name || 'Unknown'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      pred.prediction === 'Fake'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {pred.prediction === 'Fake' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {pred.prediction}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-dark-300">{pred.confidence?.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-dark-400 max-w-xs truncate">{pred.inputText?.substring(0, 80)}...</td>
                  <td className="py-3 px-4 text-dark-500 text-xs">{formatDate(pred.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, bgColor }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-dark-400">{label}</div>
        </div>
      </div>
    </div>
  )
}
