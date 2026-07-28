"use client"

import { useState, useRef } from "react"
import { Upload, ChevronDown, Music, Loader2, RotateCcw } from "lucide-react"

export default function BPMCalculator() {
  const [selectedSegment, setSelectedSegment] = useState("FULL TRACK")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [bpm, setBpm] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const segments = ["FULL TRACK", "FIRST 30 SECONDS", "MIDDLE SECTION", "LAST 30 SECONDS"]

  // החלפת הפונקציה לשימוש בספרייה המקצועית + Downsampling למהירות במובייל
  const analyzeBPM = async () => {
    if (!audioFile) return
    setIsAnalyzing(true)
    setBpm(null)

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // ביצוע Downsampling ל-16kHz - זה חותך את כמות הנתונים פי 3 ומזרז את הניתוח בטירוף
      const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000)
      const source = offlineCtx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(offlineCtx.destination)
      source.start()
      
      const resampledBuffer = await offlineCtx.startRendering()

      const { analyze } = await import("web-audio-beat-detector")
      const detectedBpm = await analyze(resampledBuffer)
      
      let finalBpm = Math.round(detectedBpm)

      // תיקון טווח מוזיקלי סטנדרטי (70-150)
      while (finalBpm < 70) finalBpm *= 2
      while (finalBpm > 150) finalBpm /= 2
      
      setBpm(Math.round(finalBpm))
    } catch (error) {
      console.error("Analysis failed:", error)
      alert("Error analyzing audio.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBpm(null)
      setFileName(file.name)
      setAudioFile(file)
      e.target.value = "" 
    }
  }

  const resetCalculator = () => {
    setBpm(null)
    setAudioFile(null)
    setFileName(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="min-h-[100dvh] text-white flex flex-col relative overflow-hidden" dir="ltr">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#ff007f]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#ff007f]/5 rounded-full blur-[100px]" />
      </div>

      <header className="w-full relative z-20 flex flex-col items-center shrink-0 mt-8 mb-6">
        <img src="/bpm-icon.png" alt="BPM Calculator" className="w-[100px] h-[100px] mb-2 object-contain" />
        <h1 className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/60">BPM Calculator</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xl bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] p-10 space-y-8 border border-white/5 shadow-2xl relative z-20">
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center justify-center w-full">
              {bpm ? (
                <div className="flex flex-col items-center">
                  <span className="text-8xl font-black tracking-tighter text-[#ff007f] drop-shadow-[0_0_30px_rgba(255,0,127,0.6)]">
                    {bpm}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30 mt-2">Detected BPM</span>
                  
                  <button 
                    onClick={resetCalculator}
                    className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                  >
                    <RotateCcw className="h-3 w-3 text-[#ff007f] group-hover:rotate-[-45deg] transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Clear</span>
                  </button>
                </div>
              ) : (
                <div 
                  className="relative w-full border-2 border-dashed rounded-2xl p-12 transition-all duration-500 flex flex-col items-center gap-4 cursor-pointer z-10 border-white/10 hover:border-[#ff007f]/40 hover:bg-[#ff007f]/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".wav,.mp3,.aac,.m4a,.ogg,audio/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  <div className="w-20 h-20 rounded-full flex items-center justify-center transition-all bg-[#151515] group-hover:scale-105">
                    <Upload className="w-8 h-8 text-[#ff007f]" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center leading-relaxed">
                    {fileName ? fileName : "Upload track to analyze"}
                  </p>
                </div>
              )}
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="relative w-full">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl bg-white/5 px-5 py-4 text-[11px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
              >
                <span className="text-white/40 uppercase">Segment</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/80">{selectedSegment}</span>
                  <ChevronDown className={`h-4 w-4 text-[#ff007f] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 bottom-full z-20 mb-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#181818] shadow-2xl">
                  {segments.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSelectedSegment(s); setIsDropdownOpen(false); }}
                      className={`w-full px-5 py-4 text-left text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-[#ff007f]/10 ${selectedSegment === s ? "text-[#ff007f]" : "text-white/60"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={analyzeBPM}
              disabled={!audioFile || isAnalyzing}
              className="w-full group relative overflow-hidden rounded-xl bg-[#ff007f] py-5 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 disabled:opacity-30 disabled:grayscale"
            >
              <div className="flex items-center justify-center gap-2">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Track"
                )}
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}