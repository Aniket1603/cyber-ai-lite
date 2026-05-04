import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Image, Upload, Loader, AlertTriangle, CheckCircle, X, Eye } from 'lucide-react'
import ThreatGauge from '../components/ThreatGauge'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function DeepfakeDetector() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(f)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => toast.error('File rejected. Max 10MB, images only.'),
  })

  const clearFile = () => { setFile(null); setPreview(null); setResult(null) }

  const handleScan = async () => {
    if (!file) { toast.error('Please upload an image first'); return }
    setLoading(true)
    setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/api/scan/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Image scan failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="font-orbitron text-2xl font-bold text-white flex items-center gap-3">
          <Eye className="text-cyber-amber" /> Deepfake Detector
        </h1>
        <p className="text-cyber-gray text-sm mt-1">Upload an image to check for AI-generated manipulation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload zone */}
        <div className="cyber-card p-6 space-y-4">
          {!preview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-cyber-amber bg-cyber-amber/5'
                  : 'border-cyber-border hover:border-cyber-amber/50 hover:bg-cyber-amber/5'
              }`}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyber-amber/10 border border-cyber-amber/30 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-cyber-amber" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {isDragActive ? 'Drop image here' : 'Drag & drop image'}
                  </p>
                  <p className="text-cyber-gray text-xs mt-1">or click to browse</p>
                  <p className="text-cyber-gray text-xs mt-2">JPG, PNG, WebP • Max 10MB</p>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border border-cyber-border">
                <img src={preview} alt="Preview" className="w-full h-56 object-cover" />
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 w-7 h-7 bg-cyber-bg/80 rounded-full flex items-center justify-center text-cyber-red hover:bg-cyber-red/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {loading && (
                  <div className="absolute inset-0 bg-cyber-bg/70 flex items-center justify-center">
                    <div className="scan-beam" />
                    <div className="flex flex-col items-center gap-2 z-10">
                      <Loader className="w-6 h-6 text-cyber-cyan animate-spin" />
                      <span className="text-xs text-cyber-cyan font-orbitron">ANALYZING...</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-cyber-gray truncate">{file?.name} ({(file?.size / 1024).toFixed(1)} KB)</p>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={!file || loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-cyber-amber text-cyber-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {loading ? 'Analyzing Image...' : 'Analyze for Deepfake'}
          </button>
        </div>

        {/* Result panel */}
        <div className="cyber-card p-6">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full gap-4 py-8 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/5 border border-cyber-cyan/20 flex items-center justify-center">
                  <Image className="w-7 h-7 text-cyber-gray" />
                </div>
                <p className="text-cyber-gray text-sm">Upload an image and click Analyze to see results</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-cyber-amber" /> Detection Result
                </h3>

                <div className="flex justify-center">
                  <ThreatGauge
                    confidence={result.confidence}
                    threatLevel={result.threatLevel}
                    result={result.result}
                  />
                </div>

                <div className="bg-cyber-bg/50 rounded-lg p-3 space-y-2 text-xs">
                  {result.details?.analysis && Object.entries(result.details.analysis).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-cyber-gray capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className="text-white font-mono">{String(v)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-cyber-gray">Model</span>
                    <span className="text-white">{result.model}</span>
                  </div>
                </div>

                {result.result === 'REAL' ? (
                  <div className="flex items-center gap-2 text-cyber-green text-xs bg-cyber-green/10 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Image appears to be authentic and unmanipulated.
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-cyber-red text-xs bg-cyber-red/10 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    Warning: This image may be AI-generated or manipulated!
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
