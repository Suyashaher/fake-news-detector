import { useState } from 'react'
import { Upload, ImageIcon, AlertCircle } from 'lucide-react'

/**
 * ImageUpload — Deepfake detection placeholder
 * Accepts image uploads and shows a mock analysis result
 */
export default function ImageUpload() {
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target.result)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPreview(ev.target.result)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = () => {
    setAnalyzing(true)
    // Mock deepfake analysis — simulated delay
    setTimeout(() => {
      const mockScore = Math.random() * 100
      setResult({
        isDeepfake: mockScore > 60,
        confidence: mockScore > 60 ? mockScore : 100 - mockScore,
        details: mockScore > 60
          ? 'Potential manipulation detected in facial regions. Inconsistent lighting patterns found.'
          : 'No significant manipulation indicators found. Image appears authentic.',
      })
      setAnalyzing(false)
    }, 2000)
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-4 h-4 text-primary-400" />
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
          Image Deepfake Detection
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
          BETA
        </span>
      </div>

      {!preview ? (
        <label
          className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-dark-600 rounded-xl cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-all"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-dark-500 mb-2" />
          <span className="text-sm text-dark-400">Drop an image or click to upload</span>
          <span className="text-xs text-dark-500 mt-1">JPEG, PNG, WebP supported</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden">
            <img src={preview} alt="Uploaded" className="w-full h-40 object-cover" />
            <button
              onClick={() => { setPreview(null); setResult(null) }}
              className="absolute top-2 right-2 px-2 py-1 rounded-md bg-dark-900/80 text-xs text-dark-300 hover:text-white transition-colors"
            >
              Remove
            </button>
          </div>

          {!result && (
            <button
              onClick={analyzeImage}
              disabled={analyzing}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze for Deepfake'
              )}
            </button>
          )}

          {result && (
            <div className={`rounded-xl p-4 animate-fade-in ${
              result.isDeepfake ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={`w-5 h-5 ${result.isDeepfake ? 'text-red-400' : 'text-green-400'}`} />
                <span className={`font-semibold ${result.isDeepfake ? 'text-red-400' : 'text-green-400'}`}>
                  {result.isDeepfake ? 'Potential Deepfake Detected' : 'Image Appears Authentic'}
                </span>
              </div>
              <p className="text-sm text-dark-300 mb-2">{result.details}</p>
              <div className="text-xs text-dark-400">
                Confidence: <span className="font-medium text-dark-200">{result.confidence.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
