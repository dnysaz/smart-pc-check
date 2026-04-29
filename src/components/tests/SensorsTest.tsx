'use client';

import { useState, useEffect } from 'react';
import { Compass, MapPin, Navigation, Smartphone } from 'lucide-react';

export default function SensorsTest() {
  const [geoInfo, setGeoInfo] = useState<any>(null);
  const [geoError, setGeoError] = useState('');
  
  const [orientation, setOrientation] = useState<any>(null);
  const [motion, setMotion] = useState<any>(null);
  const [sensorStatus, setSensorStatus] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');

  const fetchGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoError('Requesting permission...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoInfo({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          alt: pos.coords.altitude,
          acc: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
        });
        setGeoError('');
      },
      (err) => {
        setGeoError(`Location Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const requestSensorAccess = () => {
    // iOS 13+ requires user permission explicitly via an interaction
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            setSensorStatus('granted');
            bindSensors();
          } else {
            setSensorStatus('denied');
          }
        })
        .catch(console.error);
    } else {
      // Non iOS 13+ devices
      if ('DeviceOrientationEvent' in window) {
        setSensorStatus('granted');
        bindSensors();
      } else {
        setSensorStatus('unsupported');
      }
    }
  };

  const bindSensors = () => {
    window.addEventListener('deviceorientation', (e) => {
      setOrientation({ alpha: e.alpha, beta: e.beta, gamma: e.gamma });
    });
    window.addEventListener('devicemotion', (e) => {
      if (e.acceleration) {
        setMotion({ x: e.acceleration.x, y: e.acceleration.y, z: e.acceleration.z });
      }
    });
  };

  useEffect(() => {
    // Auto-check if we don't need explicit permission (Android/Desktop)
    if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function' && 'DeviceOrientationEvent' in window) {
      setSensorStatus('granted');
      bindSensors();
    } else {
      setSensorStatus('pending'); // Requires click for iOS
    }
    
    // Auto-fetch location
    fetchGeolocation();
    
    return () => {
      // cleanup listeners if needed (not strict for this simple diagnostic)
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#f0fdfa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Compass size={32} color="#0d9488" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Sensors & Location Test</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Diagnose GPS accuracy, Gyroscope, and Accelerometer (great for phones/tablets).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', '@media (max-width: 600px)': { gridTemplateColumns: '1fr' } } as any}>
        
        {/* Location Box */}
        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MapPin size={24} color="#0d9488" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>GPS Sensor</h3>
          </div>
          
          {geoInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InfoRow label="Latitude" value={geoInfo.lat?.toFixed(6) || 'N/A'} />
              <InfoRow label="Longitude" value={geoInfo.lon?.toFixed(6) || 'N/A'} />
              <InfoRow label="Accuracy" value={geoInfo.acc ? `± ${Math.round(geoInfo.acc)} meters` : 'N/A'} highlight />
              <InfoRow label="Altitude" value={geoInfo.alt ? `${Math.round(geoInfo.alt)} meters` : 'N/A'} />
              <InfoRow label="Speed" value={geoInfo.speed ? `${geoInfo.speed.toFixed(2)} m/s` : '0 m/s'} />
              
              <a href={`https://www.google.com/maps?q=${geoInfo.lat},${geoInfo.lon}`} target="_blank" rel="noreferrer" style={{ marginTop: '12px', display: 'block', textAlign: 'center', padding: '10px', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                View on Google Maps
              </a>
            </div>
          ) : (
            <div style={{ color: geoError.includes('permission') ? '#f59e0b' : '#ef4444', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {geoError || 'Loading location data...'}
              {geoError && (
                <button onClick={fetchGeolocation} style={{ marginTop: '16px', width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#0d9488', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Retry Location
                </button>
              )}
            </div>
          )}
        </div>

        {/* Motion Box */}
        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Smartphone size={24} color="#6366f1" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Gyroscope</h3>
          </div>
          
          {sensorStatus === 'pending' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>Device motion sensors require permission to access.</p>
              <button onClick={requestSensorAccess} style={{ padding: '12px 20px', borderRadius: '12px', backgroundColor: '#6366f1', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Enable Sensors
              </button>
            </div>
          ) : sensorStatus === 'denied' || sensorStatus === 'unsupported' ? (
            <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{sensorStatus === 'denied' ? 'Permission denied.' : 'Sensors not supported on this device/browser (usually works on phones and tablets).'}</div>
          ) : (
            <div>
              {/* Visual Device Box */}
              <div style={{ 
                width: '100px', height: '150px', margin: '0 auto 24px', 
                backgroundColor: '#cbd5e1', borderRadius: '12px', border: '4px solid #475569',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `rotateX(${(orientation?.beta || 0) * -1}deg) rotateY(${(orientation?.gamma || 0)}deg) rotateZ(${(orientation?.alpha || 0)}deg)`,
                transformStyle: 'preserve-3d', transition: 'transform 0.1s ease-out'
              }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#6366f1', borderRadius: '50%', border: '4px solid #fff' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Orientation (Tilt)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <MiniStat label="X (Beta)" value={Math.round(orientation?.beta || 0)} />
                  <MiniStat label="Y (Gamma)" value={Math.round(orientation?.gamma || 0)} />
                  <MiniStat label="Z (Alpha)" value={Math.round(orientation?.alpha || 0)} />
                </div>
                
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Acceleration (m/s²)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <MiniStat label="X Axis" value={(motion?.x || 0).toFixed(1)} />
                  <MiniStat label="Y Axis" value={(motion?.y || 0).toFixed(1)} />
                  <MiniStat label="Z Axis" value={(motion?.z || 0).toFixed(1)} />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
      <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
      <span style={{ color: highlight ? '#0d9488' : '#0f172a', fontWeight: highlight ? 800 : 600, fontSize: highlight ? '1rem' : '0.9rem' }}>{value}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string, value: string | number }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#334155' }}>{value}</div>
    </div>
  );
}
