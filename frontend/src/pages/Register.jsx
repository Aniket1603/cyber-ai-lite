import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Loader, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyber-purple/10 border border-cyber-purple/30 mb-4">
            <UserPlus className="w-8 h-8 text-cyber-purple" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-cyber-cyan neon-text">CyberEye AI</h1>
          <p className="text-cyber-gray text-sm mt-1">Create your account</p>
        </div>

        <div className="cyber-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'username', label: 'Username', placeholder: 'Choose a username', type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs text-cyber-gray mb-2 uppercase tracking-wider">{label}</label>
                <input
                  className="cyber-input"
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required
                />
              </div>
            ))}
            {['password', 'confirm'].map((key) => (
              <div key={key}>
                <label className="block text-xs text-cyber-gray mb-2 uppercase tracking-wider">
                  {key === 'password' ? 'Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    className="cyber-input pr-12"
                    type={showPass ? 'text' : 'password'}
                    placeholder={key === 'password' ? 'Min 6 characters' : 'Repeat password'}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required
                  />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-gray hover:text-cyber-cyan transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="cyber-btn-primary w-full justify-center mt-2">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-cyber-gray mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyber-cyan hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
