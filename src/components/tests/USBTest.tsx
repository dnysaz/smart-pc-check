'use client';

import { useState, useEffect } from 'react';
import { Usb, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface USBDeviceSimple {
  productName?: string;
  manufacturerName?: string;
  vendorId: number;
  productId: number;
}

export default function USBTest() {
  const [devices, setDevices] = useState<USBDeviceSimple[]>([]);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const nav = navigator as any;
    if (!nav.usb) {
      setSupported(false);
      return;
    }

    const fetchDevices = async () => {
      try {
        const pairedDevices = await nav.usb.getDevices();
        setDevices(pairedDevices.map((d: any) => ({
          productName: d.productName,
          manufacturerName: d.manufacturerName,
          vendorId: d.vendorId,
          productId: d.productId
        })));
      } catch (err) {
        console.error('USB fetch error:', err);
      }
    };

    fetchDevices();

    const handleConnect = (event: any) => {
      const d = event.device;
      setDevices(prev => [...prev, {
        productName: d.productName,
        manufacturerName: d.manufacturerName,
        vendorId: d.vendorId,
        productId: d.productId
      }]);
    };

    const handleDisconnect = (event: any) => {
      const d = event.device;
      setDevices(prev => prev.filter(device => 
        !(device.vendorId === d.vendorId && device.productId === d.productId)
      ));
    };

    nav.usb.addEventListener('connect', handleConnect);
    nav.usb.addEventListener('disconnect', handleDisconnect);

    return () => {
      nav.usb.removeEventListener('connect', handleConnect);
      nav.usb.removeEventListener('disconnect', handleDisconnect);
    };
  }, []);

  const requestDevice = async () => {
    try {
      const nav = navigator as any;
      const device = await nav.usb.requestDevice({ filters: [] });
      setDevices(prev => [...prev, {
        productName: device.productName,
        manufacturerName: device.manufacturerName,
        vendorId: device.vendorId,
        productId: device.productId
      }]);
    } catch (err) {
      // User cancelled
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      maxWidth: '700px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Usb size={32} color="#0284c7" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>USB Connection Monitor</h2>
        <p style={{ color: '#64748b' }}>Monitor active USB connections and detect when devices are plugged in or removed.</p>
      </div>

      {!supported ? (
        <div style={{ 
          padding: '24px', 
          backgroundColor: '#fff7ed', 
          borderRadius: '16px', 
          border: '1px solid #ffedd5',
          color: '#c2410c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={32} />
          <p style={{ fontWeight: 600 }}>WebUSB Not Supported</p>
          <p style={{ fontSize: '0.9rem', textAlign: 'center' }}>Your browser doesn't support the WebUSB API. Please use Google Chrome or Microsoft Edge for this test.</p>
        </div>
      ) : (
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569' }}>Connected Devices ({devices.length})</h3>
            <button 
              onClick={requestDevice}
              style={{
                backgroundColor: '#0284c7',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={14} /> Scan New Device
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {devices.length === 0 ? (
              <div style={{ 
                padding: '40px', 
                border: '2px dashed #e2e8f0', 
                borderRadius: '16px', 
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <p>No paired devices found.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try plugging in a device or clicking "Scan New Device".</p>
              </div>
            ) : (
              devices.map((device, i) => (
                <div key={i} style={{ 
                  padding: '16px 20px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '8px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <Usb size={20} color="#0284c7" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{device.productName || 'Unknown Device'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{device.manufacturerName || 'Unknown Manufacturer'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>VID: {device.vendorId} | PID: {device.productId}</div>
                    <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <CheckCircle2 size={12} /> Connected
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '12px', 
            border: '1px solid #e0f2fe',
            fontSize: '0.85rem',
            color: '#0369a1',
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '10px' }}><strong>⚠️ Important Note:</strong></p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li><strong>External Hard Drives / Flash Drives:</strong> Standard storage devices are usually "locked" by your Operating System (Windows/macOS) and will not appear here for security reasons.</li>
              <li><strong>Supported Devices:</strong> This tool is best for detecting peripherals like USB Hubs, Arduino, Keyboards, Mice, and custom USB controllers.</li>
              <li><strong>Privacy:</strong> For security, browsers only allow access to devices that have been explicitly paired using the "Scan" button.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
