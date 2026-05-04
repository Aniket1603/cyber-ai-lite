import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Link2, Mail, Image, FileText,
  Shield, LogOut, User, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/url-scanner', icon: Link2,           label: 'URL Scanner' },
  { to: '/email',       icon: Mail,            label: 'Email Analyzer' },
  { to: '/deepfake',    icon: Image,           label: 'Deepfake Detector' },
  { to: '/reports',     icon: FileText,        label: 'Reports' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <aside className="w-64 min-h-screen bg-cyber-card border-r border-cyber-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-cyber-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyber-cyan" />
          </div>
          <div>
            <h1 className="font-orbitron text-sm font-bold text-cyber-cyan neon-text">CyberEye</h1>
            <p className="text-[10px] text-cyber-gray">AI LITE v1.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20'
                    : 'text-cyber-gray hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-cyber-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-cyber-purple/20 border border-cyber-purple/30 flex items-center justify-center">
            <User className="w-4 h-4 text-cyber-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-cyber-gray">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cyber-red hover:bg-cyber-red/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
