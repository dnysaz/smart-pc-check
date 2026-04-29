'use client';

import { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryFull, BatteryMedium, BatteryWarning, Zap } from 'lucide-react';

export default function BatteryTest() {
  const [battery, setBattery] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isSubscribed = true;

    const getBat = async () => {
      if ('getBattery' in navigator) {
        try {
          const bat = await (navigator as any).getBattery();
          if (isSubscribed) {
            updateBattery(bat);
            bat.addEventListener('levelchange', () => updateBattery(bat));
            bat.addEventListener('chargingchange', () => updateBattery(bat));
            bat.addEventListener('chargingtimechange', () => updateBattery(bat));
            bat.addEventListener('dischargingtimechange', () => updateBattery(bat));
          }
        } catch (err) {
          if (isSubscribed) setError('Failed to read battery status.');
        }
      } else {
        setError('Battery API is not supported in this browser (try Chrome/Edge on a laptop/phone).');
      }
    };

    getBat();

    return () => { isSubscribed = false; };
  }, []);

  const updateBattery = (bat: any) => {
    setBattery({
      level: bat.level,
      charging: bat.charging,
      chargingTime: bat.chargingTime,
      dischargingTime: bat.dischargingTime
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds === Infinity) return 'Calculating...';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} minutes`;
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Battery size={32} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Battery Health & Status</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time battery level and power status detection.</p>
      </div>

      {error ? (
        <div style={{ padding: '24px', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '16px', color: '#991b1b', fontWeight: 600 }}>
          {error}
        </div>
      ) : !battery ? (
        <div style={{ padding: '24px', color: '#64748b' }}>Reading battery sensor...</div>
      ) : (
        <div>
          {/* Big Battery Visual */}
          <div style={{ position: 'relative', width: '160px', height: '240px', margin: '0 auto 32px' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40px', height: '12px', backgroundColor: '#cbd5e1', borderRadius: '8px 8px 0 0' }} />
            <div style={{ position: 'absolute', top: '10px', left: 0, width: '100%', height: 'calc(100% - 10px)', border: '6px solid #cbd5e1', borderRadius: '20px', padding: '6px', backgroundColor: '#fff' }}>
              <div style={{ 
                height: `${battery.level * 100}%`, 
                position: 'absolute', bottom: '6px', left: '6px', right: '6px', width: 'calc(100% - 12px)',
                backgroundColor: battery.level > 0.5 ? '#22c55e' : battery.level > 0.2 ? '#f59e0b' : '#ef4444',
                borderRadius: '12px',
                transition: 'height 1s ease-out, background-color 0.5s',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {battery.charging && <Zap size={48} color="#fff" style={{ opacity: 0.5 }} />}
              </div>
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
              {Math.round(battery.level * 100)}%
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Status</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: battery.charging ? '#16a34a' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {battery.charging ? <><BatteryCharging size={20} /> Plugged In</> : <><Battery size={20} /> On Battery</>}
              </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {battery.charging ? 'Time to Full' : 'Time Left'}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {battery.charging ? formatTime(battery.chargingTime) : formatTime(battery.dischargingTime)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
