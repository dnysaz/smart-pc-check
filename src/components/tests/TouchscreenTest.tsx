'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Fingerprint, RotateCcw, CheckCircle2, Smartphone, Maximize } from 'lucide-react';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  force: number;
  radius: number;
  color: string;
}

interface LastPos {
  [id: number]: { x: number; y: number };
}

const COLORS = ['#0070f3', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4'];
const GRID = 5; // 5x5 fullscreen zone grid
const TOTAL_ZONES = GRID * GRID;

type TestMode = 'draw' | 'multitouch' | 'zones';

export default function TouchscreenTest() {
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [maxTouches, setMaxTouches] = useState(0);
  const [totalTaps, setTotalTaps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean | null>(null);
  const [testMode, setTestMode] = useState<TestMode>('zones');
  const [zonesHit, setZonesHit] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawFsCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastPosRef = useRef<LastPos>({});

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  useEffect(() => {
    const handleFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const getColor = (id: number) => COLORS[id % COLORS.length];

  const drawLine = (fromX: number, fromY: number, toX: number, toY: number, color: string, canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  };

  const getDrawCanvas = () => isFullscreen ? drawFsCanvasRef.current : drawCanvasRef.current;

  const parseTouches = (e: React.TouchEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    const pts: TouchPoint[] = [];
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return pts;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      pts.push({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
        force: (t as any).force || 0,
        radius: ((t as any).radiusX || 10) + ((t as any).radiusY || 10),
        color: getColor(t.identifier),
      });
    }
    return pts;
  };

  const hitZones = (e: React.TouchEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      const rx = (t.clientX - rect.left) / rect.width;
      const ry = (t.clientY - rect.top) / rect.height;
      const col = Math.min(GRID - 1, Math.floor(rx * GRID));
      const row = Math.min(GRID - 1, Math.floor(ry * GRID));
      setZonesHit(prev => new Set([...prev, row * GRID + col]));
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    e.preventDefault();
    setIsActive(true);
    const pts = parseTouches(e, ref);
    setTouches(pts);
    setMaxTouches(prev => Math.max(prev, pts.length));
    setTotalTaps(prev => prev + 1);
    // Record starting positions for draw lines
    if (testMode === 'draw') {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          lastPosRef.current[t.identifier] = { x: t.clientX - rect.left, y: t.clientY - rect.top };
        }
      }
    }
    if (testMode === 'zones') hitZones(e, ref);
  }, [testMode]);

  const handleTouchMove = useCallback((e: React.TouchEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    e.preventDefault();
    const pts = parseTouches(e, ref);
    setTouches(pts);
    if (testMode === 'draw') {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          const x = t.clientX - rect.left;
          const y = t.clientY - rect.top;
          const last = lastPosRef.current[t.identifier];
          if (last) drawLine(last.x, last.y, x, y, getColor(t.identifier), getDrawCanvas());
          lastPosRef.current[t.identifier] = { x, y };
        }
      }
    }
    if (testMode === 'zones') hitZones(e, ref);
  }, [testMode]);

  const handleTouchEnd = useCallback((e: React.TouchEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    e.preventDefault();
    if (e.touches.length === 0) {
      setTouches([]); setIsActive(false);
      lastPosRef.current = {};
    } else {
      setTouches(parseTouches(e, ref));
      // Remove ended touches from lastPos
      const activeIds = new Set<number>();
      for (let i = 0; i < e.touches.length; i++) activeIds.add(e.touches[i].identifier);
      for (const id of Object.keys(lastPosRef.current)) {
        if (!activeIds.has(Number(id))) delete lastPosRef.current[Number(id)];
      }
    }
  }, []);

  // Mouse fallback
  const handleMouseDown = useCallback((e: React.MouseEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    if (isTouchDevice) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setIsActive(true); setTotalTaps(prev => prev + 1);
    const pt = { id: 0, x: e.clientX - rect.left, y: e.clientY - rect.top, force: 0, radius: 20, color: COLORS[0] };
    setTouches([pt]); setMaxTouches(prev => Math.max(prev, 1));
    if (testMode === 'draw') lastPosRef.current[0] = { x: pt.x, y: pt.y };
    if (testMode === 'zones') {
      const col = Math.min(GRID - 1, Math.floor((pt.x / rect.width) * GRID));
      const row = Math.min(GRID - 1, Math.floor((pt.y / rect.height) * GRID));
      setZonesHit(prev => new Set([...prev, row * GRID + col]));
    }
  }, [isTouchDevice, testMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    if (isTouchDevice || !isActive) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    setTouches([{ id: 0, x, y, force: 0, radius: 20, color: COLORS[0] }]);
    if (testMode === 'draw') {
      const last = lastPosRef.current[0];
      if (last) drawLine(last.x, last.y, x, y, COLORS[0], getDrawCanvas());
      lastPosRef.current[0] = { x, y };
    }
    if (testMode === 'zones') {
      const col = Math.min(GRID - 1, Math.floor((x / rect.width) * GRID));
      const row = Math.min(GRID - 1, Math.floor((y / rect.height) * GRID));
      setZonesHit(prev => new Set([...prev, row * GRID + col]));
    }
  }, [isTouchDevice, isActive, testMode]);

  const handleMouseUp = useCallback(() => {
    if (isTouchDevice) return;
    setTouches([]); setIsActive(false); lastPosRef.current = {};
  }, [isTouchDevice]);

  const reset = () => {
    setTouches([]); setMaxTouches(0); setTotalTaps(0); setIsActive(false); setZonesHit(new Set());
    lastPosRef.current = {};
    // Clear canvases
    [drawCanvasRef.current, drawFsCanvasRef.current].forEach(c => {
      if (c) { const ctx = c.getContext('2d'); if (ctx) ctx.clearRect(0, 0, c.width, c.height); }
    });
  };

  const goFullscreen = () => {
    reset();
    if (fullscreenRef.current?.requestFullscreen) {
      fullscreenRef.current.requestFullscreen().catch(() => {});
      // Resize fullscreen canvas after entering
      setTimeout(() => {
        if (drawFsCanvasRef.current) {
          drawFsCanvasRef.current.width = window.innerWidth;
          drawFsCanvasRef.current.height = window.innerHeight;
        }
      }, 300);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };

  // Zone grid renderer
  const ZoneGrid = ({ w, h }: { w: string; h: string }) => (
    <>
      {Array.from({ length: TOTAL_ZONES }).map((_, i) => {
        const row = Math.floor(i / GRID);
        const col = i % GRID;
        const hit = zonesHit.has(i);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${(col / GRID) * 100}%`, top: `${(row / GRID) * 100}%`,
            width: `${100 / GRID}%`, height: `${100 / GRID}%`,
            backgroundColor: hit ? 'rgba(34,197,94,0.2)' : 'transparent',
            border: '1px dashed rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 0.15s',
          }}>
            {hit ? <CheckCircle2 size={isFullscreen ? 36 : 20} color="#22c55e" /> : <span style={{ fontSize: isFullscreen ? '0.8rem' : '0.6rem', color: 'rgba(255,255,255,0.3)' }}>●</span>}
          </div>
        );
      })}
    </>
  );

  // Fullscreen overlay
  const fullscreenOverlay = (
    <div
      ref={fullscreenRef}
      onTouchStart={(e) => handleTouchStart(e, fullscreenRef)}
      onTouchMove={(e) => handleTouchMove(e, fullscreenRef)}
      onTouchEnd={(e) => handleTouchEnd(e, fullscreenRef)}
      onTouchCancel={(e) => handleTouchEnd(e, fullscreenRef)}
      onMouseDown={(e) => handleMouseDown(e, fullscreenRef)}
      onMouseMove={(e) => handleMouseMove(e, fullscreenRef)}
      onMouseUp={handleMouseUp}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#111', zIndex: 99999, touchAction: 'none', cursor: 'crosshair',
        display: isFullscreen ? 'block' : 'none',
      }}
    >
      {testMode === 'zones' && <ZoneGrid w="100vw" h="100vh" />}

      {/* Fullscreen draw canvas */}
      <canvas ref={drawFsCanvasRef} width={typeof window !== 'undefined' ? window.innerWidth : 1920} height={typeof window !== 'undefined' ? window.innerHeight : 1080} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Touch points in fullscreen */}
      {touches.map((t) => (
        <div key={t.id} style={{ position: 'absolute', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: t.x - 30, top: t.y - 30, width: '60px', height: '60px', borderRadius: '50%', border: `2px solid ${t.color}`, opacity: 0.5 }} />
          <div style={{ position: 'absolute', left: t.x - 14, top: t.y - 14, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: t.color, boxShadow: `0 0 20px ${t.color}80` }} />
        </div>
      ))}

      {/* Fullscreen HUD */}
      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        color: '#fff', padding: '10px 24px', borderRadius: '16px',
        fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        {testMode === 'zones' && <span>🔲 Zone Coverage: <span style={{ color: zonesHit.size === TOTAL_ZONES ? '#22c55e' : '#f59e0b' }}>{zonesHit.size}/{TOTAL_ZONES}</span></span>}
        <span>👆 Max: {maxTouches}</span>
        {testMode === 'zones' && zonesHit.size === TOTAL_ZONES && <span style={{ color: '#22c55e' }}>✅ All zones passed!</span>}
      </div>

      {/* Bottom controls */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '8px', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '16px', backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
          {([
            { mode: 'draw' as TestMode, icon: '✏️ Draw' },
            { mode: 'multitouch' as TestMode, icon: '👆 Points' },
            { mode: 'zones' as TestMode, icon: '🔲 Zones' },
          ]).map(m => (
            <button key={m.mode} onClick={(e) => { e.stopPropagation(); setTestMode(m.mode); reset(); }} style={{
              padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: testMode === m.mode ? 'rgba(255,255,255,0.2)' : 'transparent',
              border: testMode === m.mode ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent',
              color: '#fff', fontSize: '0.8rem', fontWeight: testMode === m.mode ? 800 : 600,
            }}>
              {m.icon}
            </button>
          ))}
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)' }} />
        <button onClick={(e) => { e.stopPropagation(); reset(); }} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', marginLeft: '8px' }}>
          <RotateCcw size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />Reset
        </button>
        <button onClick={(e) => { e.stopPropagation(); exitFullscreen(); }} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.4)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
          ✕ Exit
        </button>
      </div>
    </div>
  );

  return (
    <>
      {fullscreenOverlay}
      <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Fingerprint size={32} color="#f59e0b" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Touchscreen Test</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Test multi-touch, drawing accuracy, and full-screen zone coverage.</p>
        </div>

        {/* Touch support */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', borderRadius: '14px', marginBottom: '20px', backgroundColor: isTouchDevice ? '#f0fdf4' : '#fffbeb', border: `1px solid ${isTouchDevice ? '#bbf7d0' : '#fde68a'}` }}>
          <Smartphone size={18} color={isTouchDevice ? '#16a34a' : '#d97706'} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isTouchDevice ? '#166534' : '#92400e' }}>
            {isTouchDevice === null ? 'Detecting...' : isTouchDevice ? `✅ Touch supported (Max: ${navigator.maxTouchPoints} points)` : '⚠️ No touchscreen detected — using mouse fallback.'}
          </span>
        </div>

        {/* Fullscreen Test Button */}
        <button onClick={goFullscreen} style={{
          width: '100%', padding: '18px', borderRadius: '16px', marginBottom: '24px',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff',
          border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          boxShadow: '0 10px 30px rgba(245,158,11,0.3)', transition: 'all 0.2s',
        }}>
          <Maximize size={20} /> Start Fullscreen Test
        </button>

        {/* Mode Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {([
            { mode: 'draw' as TestMode, label: '✏️ Draw', desc: 'Line accuracy' },
            { mode: 'multitouch' as TestMode, label: '👆 Multi-Touch', desc: 'Point detection' },
            { mode: 'zones' as TestMode, label: '🔲 Zones', desc: 'Area coverage' },
          ]).map(m => (
            <button key={m.mode} onClick={() => { setTestMode(m.mode); reset(); }} style={{
              padding: '14px 10px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
              border: testMode === m.mode ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              backgroundColor: testMode === m.mode ? '#fffbeb' : '#fff',
              color: testMode === m.mode ? '#92400e' : '#64748b',
            }}>
              <div style={{ fontSize: '1rem', marginBottom: '4px', fontWeight: 700 }}>{m.label}</div>
              <div style={{ fontSize: '0.7rem' }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <StatBox label="Active" value={touches.length} color={touches.length > 0 ? '#0070f3' : '#cbd5e1'} />
          <StatBox label="Max" value={maxTouches} color={maxTouches > 0 ? '#22c55e' : '#cbd5e1'} />
          <StatBox label="Taps" value={totalTaps} color={totalTaps > 0 ? '#f59e0b' : '#cbd5e1'} />
          {testMode === 'zones' && <StatBox label="Zones" value={`${zonesHit.size}/${TOTAL_ZONES}`} color={zonesHit.size === TOTAL_ZONES ? '#22c55e' : '#f59e0b'} />}
        </div>

        {/* Inline Canvas */}
        <div
          ref={canvasRef}
          onTouchStart={(e) => handleTouchStart(e, canvasRef)}
          onTouchMove={(e) => handleTouchMove(e, canvasRef)}
          onTouchEnd={(e) => handleTouchEnd(e, canvasRef)}
          onTouchCancel={(e) => handleTouchEnd(e, canvasRef)}
          onMouseDown={(e) => handleMouseDown(e, canvasRef)}
          onMouseMove={(e) => handleMouseMove(e, canvasRef)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '100%', height: '360px', borderRadius: '20px', position: 'relative', overflow: 'hidden',
            border: `2px solid ${isActive ? '#f59e0b' : '#e2e8f0'}`,
            backgroundColor: '#1a1a2e', touchAction: 'none', cursor: 'crosshair',
            transition: 'border-color 0.2s',
          }}
        >
          {testMode === 'zones' && <ZoneGrid w="100%" h="100%" />}

          {/* Draw canvas for continuous lines */}
          <canvas ref={drawCanvasRef} width={620} height={360} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

          {touches.map((t) => (
            <div key={t.id} style={{ position: 'absolute', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: t.x - 24, top: t.y - 24, width: '48px', height: '48px', borderRadius: '50%', border: `2px solid ${t.color}`, opacity: 0.4, animation: 'ripple 0.6s ease-out' }} />
              <div style={{ position: 'absolute', left: t.x - 10, top: t.y - 10, width: '20px', height: '20px', borderRadius: '50%', backgroundColor: t.color, boxShadow: `0 0 15px ${t.color}80` }} />
              {testMode === 'multitouch' && (
                <div style={{ position: 'absolute', left: t.x + 18, top: t.y - 8, fontSize: '0.6rem', color: '#fff', fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                  #{t.id} ({Math.round(t.x)}, {Math.round(t.y)})
                </div>
              )}
            </div>
          ))}

          {!isActive && touches.length === 0 && zonesHit.size === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'rgba(255,255,255,0.2)' }}>
              <Fingerprint size={48} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Touch or click here to begin</span>
            </div>
          )}
        </div>

        <button onClick={reset} style={{
          width: '100%', marginTop: '16px', padding: '14px', borderRadius: '14px',
          border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer',
          fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <RotateCcw size={16} /> Reset Test
        </button>

        <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.6', textAlign: 'center' }}>
          💡 Use <strong>Fullscreen Zone Test</strong> to check for dead touch areas across the entire screen. Swipe across all {TOTAL_ZONES} zones — any zone that doesn't light up may indicate a touch-dead area.
        </p>
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  );
}

function StatBox({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ flex: 1, padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
