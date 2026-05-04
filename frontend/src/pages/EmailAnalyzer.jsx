import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Send, Loader, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import ThreatGauge from '../components/ThreatGauge'
import api from '../api/axios'
import toast from 'react-hot-toast'

const EXAMPLE_SPAM = `Congratulations! You have been selected as the WINNER of our $1,000,000 lottery!
Click here IMMEDIATELY to claim your prize before it expires!
Verify your account now to receive your FREE gift. 
URGENT: Your account will be suspended unless you act NOW!
Send your personal details and credit card information to claim@freeprize.xyz`

const EXAMPLE_HAM = `Hi Team,

Please find attached the Q1 2024 project update. 
The deadline for the next milestone has been moved to next Friday.

Let me know if you have any questions.

Best regards,
Aniket`

export default function EmailAnalyzer() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleScan = async (e) => {
    e.preventDefault()
    if (!text.trim()) { toast.error('Please paste email content'); return }
    if (text.trim().length < 10) { toast.error('Email text too short'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/api/scan/email', { text: text.trim() })
      setResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-white flex items-center gap-3">
          <Mail className="text-cyber-purple" /> Email Analyzer
        </h1>
        <p className="text-cyber-gray text-sm mt-1">Detect spam, phishing, and malicious email content</p>
      </div>

      <div className="cyber-card p-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-cyber-gray uppercase tracking-wider">Paste Email Content</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setText(EXAMPLE_SPAM); setResult(null) }}
                className="text-xs text-cyber-red hover:underline bg-cyber-red/10 px-2 py-1 rounded border border-cyber-red/20">
                Try Spam
              </button>
              <button type="button" onClick={() => { setText(EXAMPLE_HAM); setResult(null) }}
                className="text-xs text-cyber-green hover:underline bg-cyber-green/10 px-2 py-1 rounded border border-cyber-green/20">
                Try Legit
              </button>
              {text && (
                <button type="button" onClick={() => { setText(''); setResult(null) }}
                  className="text-xs text-cyber-gray hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            className="cyber-input resize-none text-sm"
            rows={8}
            placeholder="Paste the email body here for analysis..."
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-cyber-gray">{text.length} characters</span>
            <button type="submit" disabled={loading} className="cyber-btn bg-cyber-purple text-white hover:opacity-90">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Analyze Email'}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card p-6"
          >
            <h2 className="font-semibold text-white mb-6 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyber-purple" /> Analysis Result
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <ThreatGauge
                  confidence={result.confidence}
                  threatLevel={result.threatLevel}
                  result={result.result}
                />
              </div>

              <div className="space-y-3">
                <div className="bg-cyber-bg/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-cyber-gray">Classification</span>
                    <span className="text-white font-medium">{result.result}</span>
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
                    <p className="text-xs text-cyber-gray uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Info className="w-3 h-3" /> Email Analysis
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { k: 'Word Count',   v: result.details?.features?.word_count ?? result.details?.word_count },
                        { k: 'URLs Found',   v: result.details?.features?.url_count ?? result.details?.url_count },
                        { k: 'Exclamations',v: result.details?.features?.exclamation_count ?? result.details?.exclamation_count },
                        { k: 'Spam Keywords', v: result.details?.features?.spam_indicator_count ?? result.details?.spam_indicator_count },
                      ].map(({ k, v }) => (
                        <div key={k} className="bg-cyber-card rounded p-2">
                          <div className="text-cyber-gray">{k}</div>
                          <div className="text-white font-mono font-bold">{v ?? '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.threatLevel === 'SAFE' ? (
                  <div className="flex items-center gap-2 text-cyber-green text-sm bg-cyber-green/10 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    This email appears to be legitimate.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-cyber-red text-sm bg-cyber-red/10 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Warning: This email shows signs of spam or phishing!
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
