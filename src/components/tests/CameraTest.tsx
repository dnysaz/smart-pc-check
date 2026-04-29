'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, CameraOff } from 'lucide-react';

export default function CameraTest() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      setStream(mediaStream);
    } catch (err: any) {
      console.error('Camera Error:', err);
      setError(err.message || 'Could not access webcam.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error('Video play failed:', e));
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: '#fdf2f8', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Camera size={32} color="#db2777" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Webcam Diagnostic</h2>
        <p style={{ color: '#64748b' }}>Check your camera resolution, focus, and sensor quality.</p>
      </div>

      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '16/9', 
        backgroundColor: '#1e293b', 
        borderRadius: '16px', 
        overflow: 'hidden',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      }}>
        {stream ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            {error ? (
              <div style={{ color: '#ef4444' }}>
                <CameraOff size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>{error}</p>
              </div>
            ) : (
              <div>
                <Camera size={48} style={{ marginBottom: '12px', opacity: 0.2 }} />
                <p>Camera is currently off</p>
              </div>
            )}
          </div>
        )}
        
        {isLoading && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw className="animate-spin" color="#db2777" />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        {!stream ? (
          <button 
            onClick={startCamera}
            style={{
              backgroundColor: '#db2777',
              color: 'white',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1rem',
              boxShadow: '0 4px 14px 0 rgba(219, 39, 119, 0.39)'
            }}
          >
            <Camera size={18} /> Start Webcam Test
          </button>
        ) : (
          <button 
            onClick={stopCamera}
            style={{
              backgroundColor: '#1e293b',
              color: 'white',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CameraOff size={18} /> Stop Camera
          </button>
        )}
      </div>

      <div style={{ 
        marginTop: '32px', 
        padding: '16px', 
        backgroundColor: '#fff9fb', 
        borderRadius: '12px', 
        border: '1px solid #fce7f3',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        textAlign: 'left'
      }}>
        <AlertCircle size={20} color="#db2777" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: '#be185d', lineHeight: '1.5' }}>
          <strong>Privacy Note:</strong> Your camera stream is processed locally in your browser. We never record, save, or transmit your video data to any server.
        </p>
      </div>
    </div>
  );
}
