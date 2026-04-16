"use client"

import { useState, useRef } from "react"
import { Upload, ChevronDown, Music, Loader2, RotateCcw } from "lucide-react"
// הייבוא של הספרייה המקצועית
import { analyze } from "web-audio-beat-detector"

export default function BPMCalculator() {
  const [selectedSegment, setSelectedSegment] = useState("FULL TRACK")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [bpm, setBpm] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const segments = ["FULL TRACK", "FIRST 30 SECONDS", "MIDDLE SECTION", "LAST 30 SECONDS"]

  // החלפת הפונקציה לשימוש בספרייה המקצועית
  const analyzeBPM = async () => {
    if (!audioFile) return
    setIsAnalyzing(true)
    setBpm(null)

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const arrayBuffer = await audioFile.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // שימוש באלגוריתם ה-Autocorrelation של הספרייה
      const detectedBpm = await analyze(audioBuffer)
      
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
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden bg-black text-white px-6 py-10">
      
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff007f]/10 blur-[120px]" />
        <div className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#ff007f]/20 blur-[100px]" />
      </div>

      {/* 1. HEADER - Pushed to top */}
      <header className="relative z-10 flex-none flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top duration-700">
        <div className="relative group flex flex-col items-center">
          <div className="absolute inset-0 rounded-full bg-[#ff007f]/30 blur-3xl group-hover:bg-[#ff007f]/50 transition-all duration-500" />
          <img
            src="/BPM Calculator icon.png"
            alt="BPM Calculator"
            className="relative h-24 w-24 object-contain"
          />
        </div>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/50">
          BPM Calculator
        </h1>
      </header>

      {/* 2. CENTER PANEL - Using flex-1 to center vertically and add space */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center max-w-md animate-in fade-in zoom-in duration-500 my-8">
        <div className="relative w-full rounded-[2.5rem] border border-dashed border-white/10 bg-[#111]/80 p-8 shadow-2xl backdrop-blur-3xl">
          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center justify-center min-h-[160px] w-full">
              {bpm ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
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
                <div className="flex flex-col items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-[#ff007f] shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all hover:scale-110 active:scale-95"
                  >
                    <Upload className="h-8 w-8 text-white" />
                  </button>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60 text-center max-w-[200px] leading-relaxed">
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

      {/* 3. FOOTER - Pushed to bottom */}
      <footer className="relative z-10 flex-none flex flex-col items-center gap-4 pb-4 animate-in fade-in slide-in-from-bottom duration-700">
        <p className="text-[10px] font-medium tracking-wider text-white/30">
          Powered By deVee Boutique Label
        </p>
        <div className="h-14 w-14 overflow-hidden rounded-full border border-white/10 shadow-lg">
          <img
            src="/label_logo.jpg"
            alt="deVee Boutique Label"
            className="h-full w-full object-cover"
          />
        </div>
      </footer>
    </div>
  )
}