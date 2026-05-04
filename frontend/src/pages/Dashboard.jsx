import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield, AlertTriangle, Link2, Mail, Image,
  Activity, TrendingUp, Clock
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import StatsCard from '../components/StatsCard'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const quickActions = [
  { to: '/url-scanner', icon: Link2,  label: 'Scan URL',    color: 'cyber-cyan',   bg: 'bg-cyber-cyan/10',   border: 'border-cyber-cyan/20'   },
  { to: '/email',       icon: Mail,   label: 'Scan Email',  color: 'cyber-purple', bg: 'bg-cyber-purple/10', border: 'border-cyber-purple/20' },
  { to: '/deepfake',    icon: Image,  label: 'Check Image', color: 'cyber-amber',  bg: 'bg-cyber-amber/10',  border: 'border-cyber-amber/20'  },
  { to: '/reports',     icon: Activity, label: 'View Reports', color: 'cyber-green', bg: 'bg-cyber-green/10', border: 'border-cyber-green/20'  },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/api/reports/stats'),
          api.get('/api/reports/history'),
        ])
        setStats(statsRes.data)
        setHistory(historyRes.data.slice(0, 5))
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const chartData = [
    { name: 'URL',   scans: stats?.urlScans   ?? 0 },
    { name: 'Email', scans: stats?.emailScans ?? 0 },
    { name: 'Image', scans: stats?.imageScans ?? 0 },
  ]

  const getBadge = (tl) => {
    if (tl === 'MALICIOUS')  return <span className="badge-malicious">{tl}</span>
    if (tl === 'SUSPICIOUS') return <span className="badge-suspicious">{tl}</span>
    return <span className="badge-safe">{tl}</span>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="font-orbitron text-2xl font-bold text-white"
        >
          Welcome back,{' '}
          <span className="text-cyber-cyan neon-text">{user?.username}</span>
        </motion.h1>
        <p className="text-cyber-gray text-sm mt-1">Here's your security overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Shield}       label="Total Scans"      value={stats?.totalScans  ?? '—'} color="cyan"   />
        <StatsCard icon={AlertTriangle} label="Threats Detected" value={stats?.totalThreats ?? '—'} color="red"    />
        <StatsCard icon={Link2}         label="URL Scans"         value={stats?.urlScans    ?? '—'} color="purple" />
        <StatsCard icon={Image}         label="Image Scans"       value={stats?.imageScans  ?? '—'} color="amber"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="cyber-card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-cyber-cyan" />
            <h2 className="font-semibold text-white text-sm">Scan Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#8899aa', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8899aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0d1b2e', border: '1px solid #0f2544', borderRadius: 8, color: '#fff' }}
                cursor={{ fill: 'rgba(0,212,255,0.05)' }}
              />
              <Bar dataKey="scans" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={['#00d4ff','#7c3aed','#ffaa00'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="cyber-card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-cyber-cyan" />
            <h2 className="font-semibold text-white text-sm">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ to, icon: Icon, label, color, bg, border }) => (
              <Link key={to} to={to}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`${bg} border ${border} rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all`}
                >
                  <Icon className={`w-5 h-5 text-${color}`} />
                  <span className="text-xs font-medium text-white">{label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Scans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="cyber-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyber-cyan" />
            <h2 className="font-semibold text-white text-sm">Recent Scans</h2>
          </div>
          <Link to="/reports" className="text-xs text-cyber-cyan hover:underline">View all →</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-cyber-gray py-8 text-sm">No scans yet. Start scanning!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cyber-gray text-xs uppercase tracking-wider border-b border-cyber-border">
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Input</th>
                  <th className="pb-3 pr-4">Result</th>
                  <th className="pb-3 pr-4">Threat</th>
                  <th className="pb-3">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/50">
                {history.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 bg-cyber-cyan/10 text-cyber-cyan rounded text-xs font-medium">
                        {scan.scanType}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-cyber-gray max-w-[200px] truncate">{scan.input}</td>
                    <td className="py-3 pr-4 text-white font-medium">{scan.result}</td>
                    <td className="py-3 pr-4">{getBadge(scan.threatLevel)}</td>
                    <td className="py-3 text-cyber-cyan font-mono">{scan.confidence?.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}
