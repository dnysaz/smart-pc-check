'use client';

import { useState, useEffect, useCallback } from 'react';
import { Keyboard, Monitor, RefreshCw, Smartphone, Laptop } from 'lucide-react';

type LayoutMode = 'windows' | 'mac';
type LayoutType = 'qwerty' | 'azerty' | 'uk';

export default function KeyboardTest() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<LayoutMode>('windows');
  const [layout, setLayout] = useState<LayoutType>('qwerty');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setPressedKeys(prev => new Set(prev).add(e.code));
    const displayName = getDisplayName(e.code);
    setHistory(prev => [displayName, ...prev].slice(0, 8));
    playClickSound();
  }, [mode, layout]);

  const playClickSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const resetTest = () => {
    setPressedKeys(new Set());
    setHistory([]);
  };

  const getDisplayName = (code: string) => {
    if (mode === 'mac') {
      if (code === 'MetaLeft' || code === 'MetaRight') return 'Cmd';
      if (code === 'AltLeft' || code === 'AltRight') return 'Opt';
      if (code === 'ControlLeft' || code === 'ControlRight') return 'Ctrl';
    } else {
      if (code === 'MetaLeft' || code === 'MetaRight') return 'Win';
    }

    if (code === 'Escape') return 'Esc';
    if (code === 'PrintScreen') return 'PrtSc';
    if (code === 'ScrollLock') return 'ScrLk';
    if (code === 'NumLock') return 'Num';
    if (code === 'BracketLeft') return '[';
    if (code === 'BracketRight') return ']';
    if (code === 'ContextMenu') return 'Menu';
    if (code === 'PageUp') return 'PgUp';
    if (code === 'PageDown') return 'PgDn';
    if (code === 'Insert') return 'Ins';
    if (code === 'Delete') return 'Del';
    
    // Numpad cleanup
    if (code.startsWith('Numpad') && code.length === 7) {
      return code.replace('Numpad', '');
    }

    if (code === 'Digit2') return layout === 'uk' ? '"' : '2';
    if (code === 'Digit3') return layout === 'uk' ? '£' : '3';
    if (code === 'Quote') return layout === 'uk' ? '@' : "'";

    const simple = code
      .replace('Key', '')
      .replace('Digit', '')
      .replace('Left', '')
      .replace('Right', '')
      .replace('Bracket', '')
      .replace('Quote', "'")
      .replace('Semicolon', ';')
      .replace('Comma', ',')
      .replace('Period', '.')
      .replace('Slash', '/')
      .replace('Backslash', '\\')
      .replace('Minus', '-')
      .replace('Equal', '=')
      .replace('Backquote', '`');
    
    if (code === 'ArrowUp') return '↑';
    if (code === 'ArrowDown') return '↓';
    if (code === 'ArrowLeft') return '←';
    if (code === 'ArrowRight') return '→';
    if (code === 'NumpadDecimal') return '.';
    if (code === 'NumpadDivide') return '/';
    if (code === 'NumpadMultiply') return '*';
    if (code === 'NumpadSubtract') return '-';
    if (code === 'NumpadAdd') return '+';
    if (code === 'NumpadEnter') return 'Ent';
    
    return simple;
  };

  const qwertyRows = [
    ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
    ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
    ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
    ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
    ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ContextMenu', 'ControlRight']
  ];

  const azertyRows = [
    ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
    ['Tab', 'KeyA', 'KeyZ', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
    ['CapsLock', 'KeyQ', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'Quote', 'Enter'],
    ['ShiftLeft', 'KeyW', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'Comma', 'Semicolon', 'Period', 'Slash', 'ShiftRight'],
    ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ContextMenu', 'ControlRight']
  ];

  const mainRows = layout === 'qwerty' ? qwertyRows : azertyRows;

  const functionalBlock = [
    ['PrintScreen', 'ScrollLock', 'Pause'],
    ['Insert', 'Home', 'PageUp'],
    ['Delete', 'End', 'PageDown']
  ];

  const arrowKeys = [
    ['Spacer', 'ArrowUp', 'Spacer'],
    ['ArrowLeft', 'ArrowDown', 'ArrowRight']
  ];

  const numpad = [
    ['NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract'],
    ['Numpad7', 'Numpad8', 'Numpad9', 'NumpadAdd'],
    ['Numpad4', 'Numpad5', 'Numpad6', 'Spacer'],
    ['Numpad1', 'Numpad2', 'Numpad3', 'NumpadEnter'],
    ['Numpad0', 'Spacer', 'NumpadDecimal', 'Spacer']
  ];

  const renderKey = (code: string, index: number, width = '48px', height = '48px') => {
    if (code === 'Spacer') return <div key={`spacer-${index}`} style={{ width, height }} />;
    const isPressed = pressedKeys.has(code);
    
    let finalWidth = width;
    if (code === 'Backspace') finalWidth = '90px';
    if (code === 'Tab') finalWidth = '65px';
    if (code === 'Backslash') finalWidth = '65px';
    if (code === 'CapsLock') finalWidth = '80px';
    if (code === 'Enter') finalWidth = '95px';
    if (code === 'ShiftLeft') finalWidth = '115px';
    if (code === 'ShiftRight') finalWidth = '115px';
    if (code === 'Space') finalWidth = '320px';
    if (code === 'ControlLeft' || code === 'ControlRight') finalWidth = '65px';
    if (code === 'MetaLeft' || code === 'MetaRight') finalWidth = '55px';
    if (code === 'AltLeft' || code === 'AltRight') finalWidth = '55px';

    return (
      <div 
        key={code}
        style={{
          width: finalWidth,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          borderRadius: '8px',
          background: isPressed ? '#0070f3' : '#ffffff',
          color: isPressed ? '#fff' : '#1e293b',
          border: `1px solid ${isPressed ? '#0070f3' : '#e2e8f0'}`,
          boxShadow: isPressed ? '0 0 15px rgba(0,112,243,0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.05s ease',
          cursor: 'default',
          userSelect: 'none'
        }}
      >
        {getDisplayName(code)}
      </div>
    );
  };

  return (
    <div style={{ 
      width: '100%',
      maxWidth: '1300px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Keyboard className="text-blue-600" size={32} style={{ color: '#0070f3' }} />
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>Keyboard Diagnostic Center</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Test ghosting and response time. Detected keys glow <span style={{ color: '#0070f3', fontWeight: 600 }}>Blue</span>.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Layout Toggle */}
          <div style={{ 
            display: 'flex', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <button 
              onClick={() => setLayout('qwerty')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: layout === 'qwerty' ? '#fff' : 'transparent',
                color: layout === 'qwerty' ? '#000' : '#64748b',
                boxShadow: layout === 'qwerty' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              QWERTY
            </button>
            <button 
              onClick={() => setLayout('azerty')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: layout === 'azerty' ? '#fff' : 'transparent',
                color: layout === 'azerty' ? '#000' : '#64748b',
                boxShadow: layout === 'azerty' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              AZERTY
            </button>
            <button 
              onClick={() => setLayout('uk')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: layout === 'uk' ? '#fff' : 'transparent',
                color: layout === 'uk' ? '#000' : '#64748b',
                boxShadow: layout === 'uk' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              UK
            </button>
          </div>

          {/* OS Mode Toggle */}
          <div style={{ 
            display: 'flex', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <button 
              onClick={() => setMode('windows')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: mode === 'windows' ? '#fff' : 'transparent',
                color: mode === 'windows' ? '#000' : '#64748b',
                boxShadow: mode === 'windows' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Windows
            </button>
            <button 
              onClick={() => setMode('mac')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: mode === 'mac' ? '#fff' : 'transparent',
                color: mode === 'mac' ? '#000' : '#64748b',
                boxShadow: mode === 'mac' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              macOS
            </button>
          </div>
          <button 
            onClick={resetTest}
            style={{
              padding: '12px 24px',
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#475569'
            }}
          >
            <RefreshCw size={16} /> Reset
          </button>
        </div>
      </div>

      <div style={{ 
        padding: '30px', 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        border: '2px solid #0070f3',
        boxShadow: '0 10px 30px -10px rgba(0, 112, 243, 0.2)',
        display: 'flex', 
        gap: '40px', 
        overflowX: 'auto', 
        paddingBottom: '30px',
        justifyContent: 'center',
        width: 'fit-content',
        margin: '0 auto'
      }}>
        {/* Main Keyboard Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mainRows.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px' }}>
              {row.map((code, j) => renderKey(code, j))}
            </div>
          ))}
        </div>

        {/* Functional & Arrows Block */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {functionalBlock.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px' }}>
                {row.map((code, j) => renderKey(code, j))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {arrowKeys.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px' }}>
                {row.map((code, j) => renderKey(code, j))}
              </div>
            ))}
          </div>
        </div>

        {/* Numpad Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {numpad.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px' }}>
              {row.map((code, j) => renderKey(code, j))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#fff', 
        borderRadius: '16px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Recent Activity</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {history.length === 0 ? (
              <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.9rem' }}>No keys pressed yet...</span>
            ) : (
              history.map((h, i) => (
                <div key={i} style={{ 
                  padding: '6px 12px', 
                  background: '#f1f5f9', 
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {h}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
