import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Search, Loader, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import ThreatGauge from '../components/ThreatGauge'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function URLScanner() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleScan = async (e) => {
    e.preventDefault()
    if (!url.trim()) { toast.error('Please enter a URL'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/api/scan/url', { url: url.trim() })
      setResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  const examples = [
    'https://www.google.com',
    'http://paypal-secure-login.xyz/verify',
    'https://github.com/user/repo',
    'http://192.168.1.1/login?secure=1',
  ]

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-white flex items-center gap-3">
          <Link2 className="text-cyber-cyan" /> URL Scanner
        </h1>
        <p className="text-cyber-gray text-sm mt-1">Detect phishing and malicious URLs using AI</p>
      </div>

      {/* Input */}
      <div className="cyber-card p-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs text-cyber-gray mb-2 uppercase tracking-wider">Enter URL to Scan</label>
            <div className="relative">
              <input
                className="cyber-input pr-12 font-mono text-sm"
                placeholder="https://example.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-gray" />
            </div>
          </div>

          {/* Examples */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-cyber-gray">Try:</span>
            {examples.map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => setUrl(ex)}
                className="text-xs text-cyber-cyan hover:underline bg-cyber-cyan/5 px-2 py-1 rounded border border-cyber-cyan/20"
              >
                {ex.length > 35 ? ex.slice(0, 35) + '...' : ex}
              </button>
            ))}
          </div>

          <button type="submit" disabled={loading} className="cyber-btn-primary">
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Scanning...' : 'Scan URL'}
          </button>
        </form>

        {/* Scan beam animation */}
        {loading && (
          <div className="relative h-1 mt-4 bg-cyber-border rounded overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-[scan_1s_linear_infinite]" />
          </div>
        )}
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="cyber-card p-6"
          >
            <h2 className="font-semibold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-cyber-cyan" /> Scan Result
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gauge */}
              <div className="flex justify-center">
                <ThreatGauge
                  confidence={result.confidence}
                  threatLevel={result.threatLevel}
                  result={result.result}
                />
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="bg-cyber-bg/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cyber-gray">URL</span>
                    <span className="text-white font-mono text-xs max-w-[180px] truncate" title={url}>{url}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-gray">Confidence</span>
                    <span className="text-cyber-cyan font-mono">{result.confidence?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-gray">Model</span>
                    <span className="text-white text-xs">{result.model}</span>
                  </div>
                </div>

                {result.details?.features && (
                  <div className="bg-cyber-bg/50 rounded-lg p-4">
                    <p className="text-xs text-cyber-gray uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Info className="w-3 h-3" /> URL Features
                    </p>
                    <div className="space-y-1 text-xs">
                      {Object.entries(result.details.features || result.details).filter(([k]) =>
                        ['url_length','has_ip','has_https','suspicious_keywords','num_dots','entropy'].includes(k)
                      ).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-cyber-gray capitalize">{k.replace(/_/g, ' ')}</span>
                          <span className={`font-mono ${
                            (k === 'has_ip' || k === 'suspicious_keywords') && v ? 'text-cyber-red' : 'text-white'
                          }`}>{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.threatLevel === 'SAFE' ? (
                  <div className="flex items-center gap-2 text-cyber-green text-sm bg-cyber-green/10 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4" />
                    This URL appears safe to visit.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-cyber-red text-sm bg-cyber-red/10 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4" />
                    Exercise caution. This URL may be malicious.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
