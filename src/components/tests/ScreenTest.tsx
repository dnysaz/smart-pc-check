'use client';

import { useState, useEffect, useCallback } from 'react';
import { Monitor, Maximize, Grid, Eye, Zap, Palette } from 'lucide-react';

interface ScreenInfo {
  width: number;
  height: number;
  pixelRatio: number;
  realWidth: number;
  realHeight: number;
  colorDepth: number;
  orientation: string;
  diagonal: string;
}

type TestMode = 'solid' | 'gradient' | 'grid' | 'checkerboard';

export default function ScreenTest() {
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  const [testMode, setTestMode] = useState<TestMode>('solid');
  const [screenInfo, setScreenInfo] = useState<ScreenInfo | null>(null);
  const [showControls, setShowControls] = useState(true);

  const colors = [
    { name: 'White', hex: '#ffffff', text: '#000' },
    { name: 'Red', hex: '#ff0000', text: '#fff' },
    { name: 'Green', hex: '#00ff00', text: '#000' },
    { name: 'Blue', hex: '#0000ff', text: '#fff' },
    { name: 'Black', hex: '#000000', text: '#fff' },
    { name: 'Cyan', hex: '#00ffff', text: '#000' },
    { name: 'Magenta', hex: '#ff00ff', text: '#fff' },
    { name: 'Yellow', hex: '#ffff00', text: '#000' },
    { name: 'Gray 50%', hex: '#808080', text: '#fff' },
    { name: 'Gray 25%', hex: '#404040', text: '#fff' },
  ];

  useEffect(() => {
    const getScreenInfo = () => {
      const w = window.screen.width;
      const h = window.screen.height;
      const dpr = window.devicePixelRatio || 1;
      const realW = Math.round(w * dpr);
      const realH = Math.round(h * dpr);
      const diagPx = Math.sqrt(realW * realW + realH * realH);
      // Estimate diagonal in inches (assuming ~96 PPI base * dpr)
      const ppi = 96 * dpr;
      const diagInch = (diagPx / ppi).toFixed(1);

      setScreenInfo({
        width: w,
        height: h,
        pixelRatio: dpr,
        realWidth: realW,
        realHeight: realH,
        colorDepth: window.screen.colorDepth,
        orientation: w > h ? 'Landscape' : 'Portrait',
        diagonal: diagInch,
      });
    };
    getScreenInfo();
    window.addEventListener('resize', getScreenInfo);
    return () => window.removeEventListener('resize', getScreenInfo);
  }, []);

  const startTest = (index: number) => {
    setActiveColorIndex(index);
    setShowControls(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const nextColor = useCallback(() => {
    if (activeColorIndex === null) return;
    setActiveColorIndex((activeColorIndex + 1) % colors.length);
  }, [activeColorIndex, colors.length]);

  const prevColor = useCallback(() => {
    if (activeColorIndex === null) return;
    setActiveColorIndex((activeColorIndex - 1 + colors.length) % colors.length);
  }, [activeColorIndex, colors.length]);

  const exitTest = useCallback(() => {
    setActiveColorIndex(null);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeColorIndex !== null) {
        if (e.key === 'Escape') exitTest();
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextColor(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prevColor(); }
        if (e.key === 'h') setShowControls(v => !v);
        if (e.key === '1') setTestMode('solid');
        if (e.key === '2') setTestMode('gradient');
        if (e.key === '3') setTestMode('grid');
        if (e.key === '4') setTestMode('checkerboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeColorIndex, nextColor, prevColor, exitTest]);

  // Fullscreen test view
  if (activeColorIndex !== null) {
    const color = colors[activeColorIndex];

    const getBackground = (): React.CSSProperties => {
      switch (testMode) {
        case 'gradient':
          return { background: `linear-gradient(135deg, ${color.hex}, #000000)` };
        case 'grid':
          return {
            backgroundColor: color.hex,
            backgroundImage: `linear-gradient(rgba(128,128,128,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          };
        case 'checkerboard':
          return {
            backgroundColor: color.hex,
            backgroundImage: `
              linear-gradient(45deg, rgba(0,0,0,0.15) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(0,0,0,0.15) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.15) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.15) 75%)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
          };
        default:
          return { backgroundColor: color.hex };
      }
    };

    return (
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99999, cursor: showControls ? 'default' : 'none',
          ...getBackground(),
        }}
        onClick={nextColor}
      >
        {/* Floating Controls */}
        {showControls && (
          <div style={{
            position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: '12px',
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
            padding: '12px 24px', borderRadius: '20px',
            animation: 'fadeIn 0.3s ease',
          }}>
            {/* Prev/Next */}
            <button onClick={(e) => { e.stopPropagation(); prevColor(); }} style={btnStyle}>◀</button>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', minWidth: '80px', textAlign: 'center' }}>
              {color.name} ({activeColorIndex + 1}/{colors.length})
            </span>
            <button onClick={(e) => { e.stopPropagation(); nextColor(); }} style={btnStyle}>▶</button>

            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

            {/* Mode Switcher */}
            {(['solid', 'gradient', 'grid', 'checkerboard'] as TestMode[]).map(mode => (
              <button
                key={mode}
                onClick={(e) => { e.stopPropagation(); setTestMode(mode); }}
                style={{
                  ...btnStyle,
                  backgroundColor: testMode === mode ? 'rgba(255,255,255,0.3)' : 'transparent',
                  fontSize: '0.7rem', padding: '6px 10px', textTransform: 'capitalize',
                }}
              >
                {mode === 'solid' ? '■' : mode === 'gradient' ? '◐' : mode === 'grid' ? '▦' : '▧'} {mode}
              </button>
            ))}

            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

            <button onClick={(e) => { e.stopPropagation(); exitTest(); }} style={{ ...btnStyle, color: '#ff6b6b' }}>✕ Exit</button>
          </div>
        )}

        {/* Top-right screen info */}
        {showControls && screenInfo && (
          <div style={{
            position: 'absolute', top: '20px', right: '20px',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            color: '#fff', padding: '12px 18px', borderRadius: '14px',
            fontSize: '0.75rem', lineHeight: '1.8', textAlign: 'right',
          }}>
            <div style={{ fontWeight: 800, marginBottom: '4px' }}>📺 Screen Info</div>
            <div>Resolution: <strong>{screenInfo.width}×{screenInfo.height}</strong></div>
            <div>Native: <strong>{screenInfo.realWidth}×{screenInfo.realHeight}</strong></div>
            <div>Scale: <strong>{screenInfo.pixelRatio}x</strong></div>
            <div>Color: <strong>{screenInfo.colorDepth}-bit</strong></div>
          </div>
        )}

        {/* Hint */}
        {showControls && (
          <div style={{
            position: 'absolute', top: '20px', left: '20px',
            backgroundColor: 'rgba(0,0,0,0.5)', color: '#aaa',
            padding: '10px 16px', borderRadius: '12px', fontSize: '0.7rem', lineHeight: '1.6',
          }}>
            <strong style={{ color: '#fff' }}>Shortcuts:</strong><br />
            ← → or Click: Cycle Colors<br />
            1-4: Switch Mode<br />
            H: Toggle UI | ESC: Exit
          </div>
        )}

        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
      </div>
    );
  }

  // Main panel
  return (
    <div style={{
      backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px',
      border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      maxWidth: '700px', margin: '0 auto', textAlign: 'center'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          width: '80px', height: '80px', backgroundColor: '#f5f3ff', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Monitor size={32} color="#7c3aed" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>LCD & Dead Pixel Test</h2>
        <p style={{ color: '#64748b' }}>Professional screen test with multiple modes and auto-detected display info.</p>
      </div>

      {/* Screen Info Card */}
      {screenInfo && (
        <div style={{
          padding: '24px', backgroundColor: '#f8fafc', borderRadius: '20px',
          border: '1px solid #e2e8f0', marginBottom: '32px', textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Eye size={18} color="#7c3aed" />
            <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>Detected Display</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <InfoBlock label="Resolution" value={`${screenInfo.width} × ${screenInfo.height}`} />
            <InfoBlock label="Native Pixels" value={`${screenInfo.realWidth} × ${screenInfo.realHeight}`} />
            <InfoBlock label="Pixel Ratio" value={`${screenInfo.pixelRatio}x`} />
            <InfoBlock label="Color Depth" value={`${screenInfo.colorDepth}-bit`} />
            <InfoBlock label="Orientation" value={screenInfo.orientation} />
            <InfoBlock label="Est. Diagonal" value={`~${screenInfo.diagonal}"`} />
          </div>
        </div>
      )}

      {/* Test Modes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
        {[
          { mode: 'solid' as TestMode, icon: <Palette size={16} />, label: 'Solid' },
          { mode: 'gradient' as TestMode, icon: <Zap size={16} />, label: 'Gradient' },
          { mode: 'grid' as TestMode, icon: <Grid size={16} />, label: 'Grid' },
          { mode: 'checkerboard' as TestMode, icon: <Maximize size={16} />, label: 'Checker' },
        ].map(m => (
          <button
            key={m.mode}
            onClick={() => setTestMode(m.mode)}
            style={{
              padding: '12px', borderRadius: '12px', border: '1px solid',
              borderColor: testMode === m.mode ? '#7c3aed' : '#e2e8f0',
              backgroundColor: testMode === m.mode ? '#f5f3ff' : '#fff',
              color: testMode === m.mode ? '#7c3aed' : '#64748b',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Color Swatches */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '28px' }}>
        {colors.map((color, i) => (
          <button
            key={color.name}
            onClick={() => startTest(i)}
            style={{
              height: '56px', backgroundColor: color.hex, borderRadius: '14px',
              border: color.name === 'White' ? '1px solid #e2e8f0' : '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
              boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)'; }}
            title={color.name}
          >
            <span style={{
              position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap',
            }}>{color.name}</span>
          </button>
        ))}
      </div>

      {/* Start Button */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => startTest(0)}
          style={{
            width: '100%', padding: '16px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '1rem', boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.45)'}
          onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.3)'}
        >
          <Maximize size={18} /> Start Fullscreen Test ({testMode})
        </button>
      </div>

      <p style={{ marginTop: '24px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.6' }}>
        💡 Look closely at each color for any dots that don't match the background. Dead pixels appear as tiny bright or dark spots that remain constant across all colors.
      </p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>{value}</div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  color: '#fff',
  padding: '8px 14px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '0.85rem',
};
