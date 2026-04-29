'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MousePointer2, RotateCcw, AlertTriangle } from 'lucide-react';

export default function MouseTest() {
  const [buttons, setButtons] = useState({
    left: false, right: false, middle: false, back: false, forward: false
  });
  const [clickCounts, setClickCounts] = useState({
    left: 0, right: 0, middle: 0, back: 0, forward: 0
  });
  const [doubleClicks, setDoubleClicks] = useState(0);
  const [scrollDelta, setScrollDelta] = useState(0);
  
  // Polling rate
  const [hz, setHz] = useState(0);
  const [maxHz, setMaxHz] = useState(0);
  const mouseMoveCount = useRef(0);
  const lastTime = useRef(performance.now());
  const rafId = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    updateButton(e.button, true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    updateButton(e.button, false);
    // Increment click counts on mouse up
    switch (e.button) {
      case 0: setClickCounts(p => ({ ...p, left: p.left + 1 })); break;
      case 1: setClickCounts(p => ({ ...p, middle: p.middle + 1 })); break;
      case 2: setClickCounts(p => ({ ...p, right: p.right + 1 })); break;
      case 3: setClickCounts(p => ({ ...p, back: p.back + 1 })); break;
      case 4: setClickCounts(p => ({ ...p, forward: p.forward + 1 })); break;
    }
  };

  const updateButton = (btnCode: number, isDown: boolean) => {
    switch (btnCode) {
      case 0: setButtons(prev => ({ ...prev, left: isDown })); break;
      case 1: setButtons(prev => ({ ...prev, middle: isDown })); break;
      case 2: setButtons(prev => ({ ...prev, right: isDown })); break;
      case 3: setButtons(prev => ({ ...prev, back: isDown })); break;
      case 4: setButtons(prev => ({ ...prev, forward: isDown })); break;
    }
  };

  const handleDoubleClick = () => {
    setDoubleClicks(prev => prev + 1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    setScrollDelta(prev => prev + e.deltaY);
  };

  const handleMouseMove = () => {
    mouseMoveCount.current++;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    const calculateHz = () => {
      const now = performance.now();
      const elapsed = now - lastTime.current;
      if (elapsed >= 1000) {
        const currentHz = Math.round((mouseMoveCount.current * 1000) / elapsed);
        setHz(currentHz);
        setMaxHz(prev => Math.max(prev, currentHz));
        mouseMoveCount.current = 0;
        lastTime.current = now;
      }
      rafId.current = requestAnimationFrame(calculateHz);
    };
    rafId.current = requestAnimationFrame(calculateHz);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const reset = () => {
    setButtons({ left: false, right: false, middle: false, back: false, forward: false });
    setClickCounts({ left: 0, right: 0, middle: 0, back: 0, forward: 0 });
    setDoubleClicks(0);
    setScrollDelta(0);
    setHz(0);
    setMaxHz(0);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <MousePointer2 size={32} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Mouse & Touchpad Tester</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Check buttons, scroll wheel, double-clicks, and polling rate (Hz).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <StatBox label="Current Polling Rate" value={`${hz} Hz`} highlight={hz > 500} />
        <StatBox label="Max Polling Rate" value={`${maxHz} Hz`} highlight={maxHz > 500} />
        <StatBox label="Scroll Distance" value={Math.abs(scrollDelta)} />
      </div>

      <div 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
        style={{
          width: '100%', height: '350px', borderRadius: '20px', position: 'relative',
          backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', cursor: 'crosshair',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          userSelect: 'none'
        }}
      >
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#64748b', pointerEvents: 'none', marginBottom: '20px' }}>
          Move and Click Here
        </span>

        {/* Visual Mouse Graphic */}
        <div style={{ position: 'relative', width: '120px', height: '180px', borderRadius: '60px', border: '4px solid #334155', backgroundColor: '#fff', pointerEvents: 'none' }}>
          {/* Left Button */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '40%', borderTopLeftRadius: '60px', borderRight: '2px solid #334155', borderBottom: '2px solid #334155', backgroundColor: buttons.left ? '#3b82f6' : 'transparent', transition: 'background 0.1s' }} />
          {/* Right Button */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '40%', borderTopRightRadius: '60px', borderLeft: '2px solid #334155', borderBottom: '2px solid #334155', backgroundColor: buttons.right ? '#3b82f6' : 'transparent', transition: 'background 0.1s' }} />
          {/* Middle/Scroll */}
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '32px', borderRadius: '8px', border: '2px solid #334155', backgroundColor: buttons.middle ? '#ef4444' : '#94a3b8', zIndex: 2, transition: 'background 0.1s', marginTop: (scrollDelta % 20) + 'px' }} />
          
          {/* Side Buttons (Left side indicator) */}
          <div style={{ position: 'absolute', left: '-12px', top: '40%', width: '8px', height: '24px', borderRadius: '4px', backgroundColor: buttons.forward ? '#f59e0b' : '#94a3b8', transition: 'background 0.1s' }} />
          <div style={{ position: 'absolute', left: '-12px', top: '60%', width: '8px', height: '24px', borderRadius: '4px', backgroundColor: buttons.back ? '#f59e0b' : '#94a3b8', transition: 'background 0.1s' }} />
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <ClickBadge label="Left" count={clickCounts.left} active={buttons.left} />
          <ClickBadge label="Middle" count={clickCounts.middle} active={buttons.middle} />
          <ClickBadge label="Right" count={clickCounts.right} active={buttons.right} />
          <ClickBadge label="Back (Side)" count={clickCounts.back} active={buttons.back} />
          <ClickBadge label="Forward (Side)" count={clickCounts.forward} active={buttons.forward} />
          <ClickBadge label="Double Clicks" count={doubleClicks} active={false} color="#f59e0b" />
        </div>
      </div>

      <button onClick={reset} style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <RotateCcw size={16} /> Reset Stats
      </button>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
        <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5, margin: 0 }}>
          <strong>Gaming Mouse Tip:</strong> Move your mouse in fast circles inside the box to test your maximum polling rate. Standard mice run at 125Hz, while gaming mice typically reach 500Hz to 1000Hz+.
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div style={{ padding: '16px', backgroundColor: highlight ? '#eff6ff' : '#f8fafc', borderRadius: '16px', textAlign: 'center', border: highlight ? '1px solid #bfdbfe' : '1px solid transparent' }}>
      <div style={{ fontSize: '0.75rem', color: highlight ? '#1d4ed8' : '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: highlight ? '#2563eb' : '#1e293b' }}>{value}</div>
    </div>
  );
}

function ClickBadge({ label, count, active, color = '#3b82f6' }: { label: string; count: number; active: boolean; color?: string }) {
  return (
    <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: active ? color : '#f1f5f9', color: active ? '#fff' : '#475569', transition: 'all 0.1s', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {label} <span style={{ backgroundColor: active ? 'rgba(255,255,255,0.3)' : '#e2e8f0', padding: '2px 6px', borderRadius: '10px' }}>{count}</span>
    </div>
  );
}
