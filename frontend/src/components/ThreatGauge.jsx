import React from 'react'
import { motion } from 'framer-motion'

export default function ThreatGauge({ confidence, threatLevel, result }) {
  const getColor = () => {
    if (threatLevel === 'MALICIOUS') return '#ff003c'
    if (threatLevel === 'SUSPICIOUS') return '#ffaa00'
    return '#00ff88'
  }
  const color = getColor()
  const pct = Math.min(100, Math.max(0, confidence))
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dash = (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width="140" height="140" className="rotate-[-90deg]">
          {/* Background ring */}
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#0f2544" strokeWidth="10" />
          {/* Progress ring */}
          <motion.circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold font-orbitron"
            style={{ color }}
          >
            {Math.round(pct)}%
          </motion.span>
          <span className="text-[10px] text-cyber-gray">confidence</span>
        </div>
      </div>

      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-lg font-bold font-orbitron ${
            threatLevel === 'MALICIOUS' ? 'text-cyber-red' :
            threatLevel === 'SUSPICIOUS' ? 'text-cyber-amber' : 'text-cyber-green'
          }`}
        >
          {result}
        </motion.div>
        <div className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          threatLevel === 'MALICIOUS' ? 'badge-malicious' :
          threatLevel === 'SUSPICIOUS' ? 'badge-suspicious' : 'badge-safe'
        }`}>
          {threatLevel}
        </div>
      </div>
    </div>
  )
}
