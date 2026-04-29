'use client';

import { useState, useEffect } from 'react';
import { Wifi, Globe, Activity, RefreshCw } from 'lucide-react';

export default function NetworkTest() {
  const [ipInfo, setIpInfo] = useState<any>(null);
  const [connInfo, setConnInfo] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNetworkData = async () => {
    setLoading(true);
    setLatency(null);

    // Get Connection info (Chromium only usually)
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const c = (navigator as any).connection;
      setConnInfo({
        effectiveType: c.effectiveType,
        downlink: c.downlink,
        rtt: c.rtt,
        saveData: c.saveData
      });
    }

    try {
      // Fetch IP info
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        setIpInfo(data);
      }
      
      // Measure latency with a small fetch
      const start = performance.now();
      await fetch('https://1.1.1.1/cdn-cgi/trace', { mode: 'no-cors', cache: 'no-store' });
      const end = performance.now();
      setLatency(Math.round(end - start));
      
    } catch (err) {
      console.error("Network fetch failed", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Wifi size={32} color="#3b82f6" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Network & Internet Status</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Check your public IP, ISP details, connection type, and latency.</p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <div>Analyzing connection...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Public IP Info */}
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#0f172a' }}>
              <Globe size={24} color="#3b82f6" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Public IP & ISP</h3>
            </div>
            
            {ipInfo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InfoRow label="IP Address" value={ipInfo.ip} highlight />
                <InfoRow label="ISP" value={ipInfo.org} />
                <InfoRow label="Location" value={`${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country_name}`} />
                <InfoRow label="ASN" value={ipInfo.asn} />
              </div>
            ) : (
              <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>Failed to fetch IP details. Ad blocker might be blocking the request.</div>
            )}
          </div>

          {/* Connection Speed */}
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#0f172a' }}>
              <Activity size={24} color="#10b981" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Connection Info</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InfoRow label="Est. Latency (Ping)" value={latency ? `${latency} ms` : 'N/A'} highlight />
              {connInfo ? (
                <>
                  <InfoRow label="Connection Type" value={connInfo.effectiveType ? connInfo.effectiveType.toUpperCase() : 'Unknown'} />
                  <InfoRow label="Est. Downlink" value={`${connInfo.downlink} Mbps`} />
                  <InfoRow label="Browser RTT" value={`${connInfo.rtt} ms`} />
                  <InfoRow label="Data Saver" value={connInfo.saveData ? 'Enabled' : 'Disabled'} />
                </>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Browser Network API not fully supported on this device.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <button onClick={fetchNetworkData} disabled={loading} style={{ width: '100%', marginTop: '24px', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
        <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> 
        {loading ? 'Refreshing...' : 'Refresh Network Data'}
      </button>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{label}</span>
      <span style={{ color: highlight ? '#2563eb' : '#0f172a', fontWeight: highlight ? 800 : 600, fontSize: highlight ? '1.1rem' : '0.9rem' }}>{value}</span>
    </div>
  );
}
