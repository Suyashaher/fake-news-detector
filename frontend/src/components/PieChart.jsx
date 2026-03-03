import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

/**
 * FakeRealPieChart — Recharts pie chart showing Fake vs Real distribution
 */
export default function FakeRealPieChart({ fakeCount = 0, trueCount = 0 }) {
  const data = [
    { name: 'True News', value: trueCount, color: '#22c55e' },
    { name: 'Fake News', value: fakeCount, color: '#ef4444' },
  ]

  const total = fakeCount + trueCount

  if (total === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
          Prediction Distribution
        </h3>
        <div className="flex items-center justify-center h-48 text-dark-500 text-sm">
          No predictions yet
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { name, value } = payload[0]
      return (
        <div className="glass-light rounded-lg px-3 py-2 text-sm shadow-xl">
          <span style={{ color: payload[0].payload.color }} className="font-semibold">{name}</span>
          <span className="text-dark-300 ml-2">{value} ({((value / total) * 100).toFixed(1)}%)</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
        Prediction Distribution
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-dark-300 text-xs ml-1">{value}</span>}
          />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  )
}
