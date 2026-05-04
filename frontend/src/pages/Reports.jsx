import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Filter, Download, Search, RefreshCw } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const TYPE_COLORS = {
  URL:   'bg-cyber-cyan/20 text-cyber-cyan',
  EMAIL: 'bg-cyber-purple/20 text-cyber-purple',
  IMAGE: 'bg-cyber-amber/20 text-cyber-amber',
}

const THREAT_COLORS = {
  SAFE:       'badge-safe',
  SUSPICIOUS: 'badge-suspicious',
  MALICIOUS:  'badge-malicious',
}

export default function Reports() {
  const [history, setHistory] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [threatFilter, setThreatFilter] = useState('ALL')

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/reports/history')
      setHistory(res.data)
      setFiltered(res.data)
    } catch {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [])

  useEffect(() => {
    let data = [...history]
    if (typeFilter !== 'ALL') data = data.filter(s => s.scanType === typeFilter)
    if (threatFilter !== 'ALL') data = data.filter(s => s.threatLevel === threatFilter)
    if (search) data = data.filter(s =>
      s.input?.toLowerCase().includes(search.toLowerCase()) ||
      s.result?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(data)
  }, [history, typeFilter, threatFilter, search])

  const exportCSV = () => {
    const headers = ['ID','Type','Input','Result','Threat','Confidence','Timestamp']
    const rows = filtered.map(s => [
      s.id, s.scanType,
      `"${(s.input || '').replace(/"/g, '""')}"`,
      s.result, s.threatLevel,
      s.confidence?.toFixed(2),
      s.timestamp ? new Date(s.timestamp).toLocaleString() : ''
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `cybereye_reports_${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="text-cyber-green" /> Scan Reports
          </h1>
          <p className="text-cyber-gray text-sm mt-1">{filtered.length} records found</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchHistory} className="cyber-btn-outline text-sm py-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={exportCSV} disabled={filtered.length === 0} className="cyber-btn-primary text-sm py-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="cyber-card p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-gray" />
            <input
              className="cyber-input pl-9 py-2 text-sm"
              placeholder="Search by input or result..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 bg-cyber-bg rounded-lg p-1 border border-cyber-border">
            {['ALL','URL','EMAIL','IMAGE'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  typeFilter === t ? 'bg-cyber-cyan text-cyber-bg' : 'text-cyber-gray hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Threat filter */}
          <div className="flex items-center gap-1 bg-cyber-bg rounded-lg p-1 border border-cyber-border">
            {['ALL','SAFE','SUSPICIOUS','MALICIOUS'].map(t => (
              <button
                key={t}
                onClick={() => setThreatFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  threatFilter === t ? 'bg-cyber-cyan text-cyber-bg' : 'text-cyber-gray hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="cyber-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-cyber-gray mx-auto mb-3 opacity-50" />
            <p className="text-cyber-gray">No records match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-cyber-border">
                <tr className="text-left text-cyber-gray text-xs uppercase tracking-wider">
                  {['#','Type','Input','Result','Threat Level','Confidence','Time'].map(h => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/30">
                {filtered.map((scan, i) => (
                  <motion.tr
                    key={scan.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-cyber-gray font-mono text-xs">{scan.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${TYPE_COLORS[scan.scanType] || 'bg-white/10 text-white'}`}>
                        {scan.scanType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cyber-gray max-w-[220px]">
                      <span className="truncate block" title={scan.input}>{scan.input}</span>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{scan.result}</td>
                    <td className="px-4 py-3">
                      <span className={THREAT_COLORS[scan.threatLevel] || ''}>
                        {scan.threatLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cyber-cyan font-mono">{scan.confidence?.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-cyber-gray text-xs">
                      {scan.timestamp ? new Date(scan.timestamp).toLocaleString() : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
