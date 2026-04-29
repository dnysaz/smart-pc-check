'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Play, Square, RefreshCw, Volume2 } from 'lucide-react';

export default function MicTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const drawWave = useCallback((analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    const render = () => {
      animationRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      // Calculate volume level
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) sum += freqData[i];
      const avg = sum / freqData.length;
      setVolume(Math.min(100, Math.round((avg / 128) * 100)));

      // Clear
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0070f3';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw center line
      ctx.strokeStyle = 'rgba(0,112,243,0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    render();
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup AudioContext + Analyser
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await audioCtx.resume();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      // Setup MediaRecorder
      const types = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
      const supportedType = types.find(type => MediaRecorder.isTypeSupported(type));

      const mediaRecorder = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedType || 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setTimeLeft(30);
      setAudioURL(null);
      setVolume(0);

      // Start waveform drawing DIRECTLY (no useEffect race condition)
      drawWave(analyser);

      // Countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Mic Error:', err);
      setError(err.message || 'Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    // Stop animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    // Stop recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // Stop stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // Close audio context
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsRecording(false);
    setVolume(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error('Play failed:', e));
      setIsPlaying(true);
    }
  };

  const resetTest = () => {
    stopRecording();
    setAudioURL(null);
    setTimeLeft(30);
    setIsRecording(false);
    setIsPlaying(false);
    setVolume(0);
    setError(null);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: isRecording ? '#fee2e2' : '#eff6ff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          transition: 'all 0.3s',
          animation: isRecording ? 'pulse 1.5s infinite' : 'none'
        }}>
          <Mic size={32} color={isRecording ? '#ef4444' : '#0070f3'} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Microphone Diagnostic</h2>
        <p style={{ color: '#64748b' }}>Test your mic with real-time waveform visualization and recording.</p>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fff1f2', borderRadius: '12px', border: '1px solid #fecdd3', marginBottom: '24px', color: '#991b1b', fontSize: '0.9rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginBottom: '40px' }}>
        {isRecording ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#ef4444' }}>
              00:{timeLeft.toString().padStart(2, '0')}
            </div>

            {/* Waveform Canvas */}
            <div style={{ width: '100%', maxWidth: '500px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={120}
                style={{ width: '100%', height: '120px', display: 'block' }}
              />
            </div>

            {/* Volume Level Bar */}
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Volume Level</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: volume > 50 ? '#22c55e' : volume > 15 ? '#eab308' : '#ef4444' }}>{volume}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${volume}%`,
                  background: volume > 50 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : volume > 15 ? 'linear-gradient(90deg, #eab308, #f59e0b)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
                  borderRadius: '4px',
                  transition: 'width 0.1s ease-out'
                }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                {volume < 5 ? '🔇 No sound detected. Try speaking louder.' : volume < 20 ? '🔈 Low volume. Speak closer to the mic.' : volume < 60 ? '🔊 Good signal! Mic is working.' : '🎤 Excellent! Loud and clear.'}
              </p>
            </div>

            <button
              onClick={stopRecording}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Square size={18} fill="white" /> Stop Recording
            </button>
          </div>
        ) : audioURL ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              padding: '24px',
              background: '#f0fdf4',
              borderRadius: '16px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Volume2 color="#16a34a" />
                <span style={{ fontWeight: 600, color: '#166534' }}>✅ Recording Complete</span>
              </div>
              <button
                onClick={playAudio}
                style={{
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Play size={16} fill="white" /> {isPlaying ? 'Playing...' : 'Playback'}
              </button>
            </div>
            <button
              onClick={resetTest}
              style={{
                background: 'transparent',
                border: '1px solid #e2e8f0',
                padding: '12px',
                borderRadius: '10px',
                color: '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} /> Record Again
            </button>
            <audio ref={audioRef} src={audioURL} onEnded={() => setIsPlaying(false)} style={{ display: 'none' }} />
          </div>
        ) : (
          <button
            onClick={startRecording}
            style={{
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '18px 48px',
              borderRadius: '14px',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto',
              boxShadow: '0 10px 15px -3px rgba(0, 112, 243, 0.3)'
            }}
          >
            <Mic size={20} fill="white" /> Start Diagnostic
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
