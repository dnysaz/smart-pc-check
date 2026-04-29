'use client';

import { useState, useRef } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, Headphones } from 'lucide-react';

export default function SpeakerTest() {
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState<'left' | 'right' | 'both' | 'music' | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const musicPannerRef = useRef<StereoPannerNode | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = (channel: 'left' | 'right' | 'both') => {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const panner = ctx.createStereoPanner();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);

    if (channel === 'left') panner.pan.setValueAtTime(-1, ctx.currentTime);
    else if (channel === 'right') panner.pan.setValueAtTime(1, ctx.currentTime);
    else panner.pan.setValueAtTime(0, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);

    oscillator.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 1.5);

    setIsPlaying(channel);
    setTimeout(() => setIsPlaying(null), 1500);
  };

  const toggleMusic = async () => {
    if (!musicRef.current) {
      musicRef.current = new Audio('https://raw.githubusercontent.com/mdn/webaudio-examples/master/audio-analyser/viper.mp3');
      musicRef.current.loop = true;
      musicRef.current.crossOrigin = "anonymous";
    }

    if (isMusicPlaying) {
      musicRef.current.pause();
      setIsMusicPlaying(false);
      setIsPlaying(null);
      return;
    }

    const ctx = initAudio();
    try {
      if (!musicSourceRef.current) {
        musicSourceRef.current = ctx.createMediaElementSource(musicRef.current);
        musicPannerRef.current = ctx.createStereoPanner();
        const gain = ctx.createGain();
        musicSourceRef.current.connect(musicPannerRef.current);
        musicPannerRef.current.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = volume;
      }

      await ctx.resume();
      await musicRef.current.play();
      setIsMusicPlaying(true);
      setIsPlaying('music');
    } catch (err) {
      console.error('WebAudio playback failed, trying direct play:', err);
      musicRef.current.play();
      setIsMusicPlaying(true);
      setIsPlaying('music');
    }
  };

  const panMusic = (pan: number) => {
    if (musicPannerRef.current && audioCtxRef.current) {
      musicPannerRef.current.pan.setValueAtTime(pan, audioCtxRef.current.currentTime);
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      maxWidth: '650px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#f0fdf4', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Headphones size={32} color="#22c55e" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Speaker & Channel Test</h2>
        <p style={{ color: '#64748b' }}>Check if your left and right speakers are working correctly.</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
          {volume === 0 ? <VolumeX size={20} color="#64748b" /> : <Volume2 size={20} color="#0070f3" />}
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              if (musicRef.current) musicRef.current.volume = val;
            }}
            style={{ 
              flex: 1, 
              cursor: 'pointer',
              accentColor: '#0070f3'
            }}
          />
          <span style={{ minWidth: '45px', fontWeight: 700, color: '#1e293b' }}>{Math.round(volume * 100)}%</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <button 
            onClick={() => playTone('left')}
            style={{
              padding: '24px',
              borderRadius: '16px',
              border: `2px solid ${isPlaying === 'left' ? '#22c55e' : '#e2e8f0'}`,
              background: isPlaying === 'left' ? '#f0fdf4' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isPlaying === 'left' ? '#22c55e' : '#1e293b' }}>L</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Left Channel</span>
          </button>

          <button 
            onClick={() => playTone('right')}
            style={{
              padding: '24px',
              borderRadius: '16px',
              border: `2px solid ${isPlaying === 'right' ? '#22c55e' : '#e2e8f0'}`,
              background: isPlaying === 'right' ? '#f0fdf4' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isPlaying === 'right' ? '#22c55e' : '#1e293b' }}>R</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Right Channel</span>
          </button>
        </div>

        <button 
          onClick={() => playTone('both')}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: isPlaying === 'both' ? '#22c55e' : '#1e293b',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s',
            marginBottom: '40px'
          }}
        >
          <Play size={18} fill="white" /> Test Both Speakers
        </button>

        {/* Long Music Test Section */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: '#f1f5f9', 
          borderRadius: '20px', 
          border: '1px solid #e2e8f0',
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={16} fill="#0070f3" color="#0070f3" /> High-Fidelity Stereo Experience
          </h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button 
              onClick={toggleMusic}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: isMusicPlaying ? '#ef4444' : '#0070f3',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isMusicPlaying ? 'Stop Music' : 'Play Test Track'}
            </button>
          </div>
          
          {isMusicPlaying && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Switch Panning:</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => panMusic(-1)} style={panBtnStyle}>Full Left</button>
                <button onClick={() => panMusic(0)} style={panBtnStyle}>Center</button>
                <button onClick={() => panMusic(1)} style={panBtnStyle}>Full Right</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
        Tip: If you hear the "Left" tone in your right ear, your headphones might be on backwards.
      </p>
    </div>
  );
}

const panBtnStyle = {
  flex: 1,
  padding: '8px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#fff',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s'
};
