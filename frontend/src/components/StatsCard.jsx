import React from 'react'
import { motion } from 'framer-motion'

export default function StatsCard({ icon: Icon, label, value, color = 'cyan', subtitle }) {
  const colors = {
    cyan:   { text: 'text-cyber-cyan',   bg: 'bg-cyber-cyan/10',   border: 'border-cyber-cyan/20',   glow: 'shadow-cyber-cyan/20' },
    purple: { text: 'text-cyber-purple', bg: 'bg-cyber-purple/10', border: 'border-cyber-purple/20', glow: 'shadow-cyber-purple/20' },
    red:    { text: 'text-cyber-red',    bg: 'bg-cyber-red/10',    border: 'border-cyber-red/20',    glow: 'shadow-cyber-red/20' },
    green:  { text: 'text-cyber-green',  bg: 'bg-cyber-green/10',  border: 'border-cyber-green/20',  glow: 'shadow-cyber-green/20' },
    amber:  { text: 'text-cyber-amber',  bg: 'bg-cyber-amber/10',  border: 'border-cyber-amber/20',  glow: 'shadow-cyber-amber/20' },
  }
  const c = colors[color] || colors.cyan

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`cyber-card p-6 shadow-lg ${c.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-cyber-gray text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-3xl font-bold font-orbitron ${c.text}`}
          >
            {value ?? '—'}
          </motion.p>
          {subtitle && <p className="text-cyber-gray text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </motion.div>
  )
}
