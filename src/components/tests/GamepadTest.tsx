'use client';

import { useState, useEffect, useRef } from 'react';
import { Gamepad2, AlertCircle } from 'lucide-react';

export default function GamepadTest() {
  const [gamepad, setGamepad] = useState<Gamepad | null>(null);
  const rafId = useRef<number>(0);

  const pollGamepad = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let connected: Gamepad | null = null;
    
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        connected = gamepads[i];
        break;
      }
    }
    
    // We clone the state because React won't detect mutations on the native Gamepad object
    if (connected) {
      setGamepad({
        id: connected.id,
        index: connected.index,
        connected: connected.connected,
        timestamp: connected.timestamp,
        mapping: connected.mapping,
        axes: [...connected.axes],
        buttons: connected.buttons.map(b => ({ pressed: b.pressed, touched: b.touched, value: b.value })),
        vibrationActuator: connected.vibrationActuator
      } as any);
    } else {
      setGamepad(null);
    }
    
    rafId.current = requestAnimationFrame(pollGamepad);
  };

  useEffect(() => {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected', e.gamepad);
    });
    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected', e.gamepad);
    });

    rafId.current = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const testVibration = () => {
    if (gamepad && (gamepad as any).vibrationActuator) {
      try {
        (gamepad as any).vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0, duration: 500, weakMagnitude: 1.0, strongMagnitude: 1.0
        });
      } catch (e) {
        console.error('Vibration not supported', e);
      }
    }
  };

  const getButtonLabel = (index: number) => {
    // Standard gamepad mapping
    const map: Record<number, string> = {
      0: 'A / Cross', 1: 'B / Circle', 2: 'X / Square', 3: 'Y / Triangle',
      4: 'LB / L1', 5: 'RB / R1', 6: 'LT / L2', 7: 'RT / R2',
      8: 'Select/Share', 9: 'Start/Options', 10: 'L3', 11: 'R3',
      12: 'D-Pad Up', 13: 'D-Pad Down', 14: 'D-Pad Left', 15: 'D-Pad Right',
      16: 'Home / PS'
    };
    return map[index] || `Btn ${index}`;
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#fdf4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: gamepad ? 'pulse 2s infinite' : 'none' }}>
          <Gamepad2 size={32} color="#c026d3" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Gamepad / Controller Tester</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Connect an Xbox, PlayStation, or generic controller to test buttons, joysticks, and vibration.</p>
      </div>

      {!gamepad ? (
        <div style={{ padding: '60px', backgroundColor: '#f8fafc', borderRadius: '20px', border: '2px dashed #cbd5e1', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎮</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Waiting for controller...</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Press any button on your connected controller to wake it up.</p>
        </div>
      ) : (
        <div>
          <div style={{ padding: '16px 20px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Connected Device</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532d' }}>{gamepad.id}</div>
            </div>
            {gamepad.vibrationActuator && (
              <button onClick={testVibration} style={{ padding: '8px 16px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(34,197,94,0.3)' }}>
                📳 Test Vibration
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {/* Analog Sticks */}
            <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '20px', textAlign: 'center' }}>Analog Sticks</h4>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Joystick axes={[gamepad.axes[0] || 0, gamepad.axes[1] || 0]} label="Left Stick" />
                <Joystick axes={[gamepad.axes[2] || 0, gamepad.axes[3] || 0]} label="Right Stick" />
              </div>
            </div>

            {/* Triggers (L2/R2) */}
            <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '20px', textAlign: 'center' }}>Triggers (Analog)</h4>
              <div style={{ display: 'flex', gap: '20px' }}>
                <Trigger value={gamepad.buttons[6]?.value || 0} label="LT / L2" />
                <Trigger value={gamepad.buttons[7]?.value || 0} label="RT / R2" />
              </div>
            </div>
          </div>

          {/* Buttons Grid */}
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginBottom: '16px' }}>Digital Buttons</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {gamepad.buttons.map((btn, i) => {
                // Skip analog triggers from digital list
                if (i === 6 || i === 7) return null;
                return (
                  <div key={i} style={{ padding: '12px', borderRadius: '12px', backgroundColor: btn.pressed ? '#c026d3' : '#f1f5f9', color: btn.pressed ? '#fff' : '#64748b', transition: 'all 0.1s', textAlign: 'center', border: btn.pressed ? '1px solid #a21caf' : '1px solid #e2e8f0', boxShadow: btn.pressed ? '0 4px 15px rgba(192,38,211,0.3)' : 'none' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{getButtonLabel(i)}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '4px' }}>B{i}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }`}</style>
    </div>
  );
}

function Joystick({ axes, label }: { axes: number[], label: string }) {
  const x = axes[0];
  const y = axes[1];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e2e8f0', position: 'relative', border: '2px solid #cbd5e1' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '2px', height: '100%', backgroundColor: 'rgba(0,0,0,0.05)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '2px', backgroundColor: 'rgba(0,0,0,0.05)' }} />
        
        <div style={{ 
          position: 'absolute', top: '50%', left: '50%', width: '40px', height: '40px', 
          backgroundColor: '#3b82f6', borderRadius: '50%', boxShadow: '0 4px 10px rgba(59,130,246,0.5)',
          transform: `translate(calc(-50% + ${x * 40}px), calc(-50% + ${y * 40}px))`,
          transition: 'transform 0.05s'
        }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{label}</div>
        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>X: {x.toFixed(2)} Y: {y.toFixed(2)}</div>
      </div>
    </div>
  );
}

function Trigger({ value, label }: { value: number, label: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '100%', height: '100px', backgroundColor: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', height: `${value * 100}%`, backgroundColor: '#f59e0b', transition: 'height 0.05s' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{label}</div>
        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: 'monospace' }}>{Math.round(value * 100)}%</div>
      </div>
    </div>
  );
}
