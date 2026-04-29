'use client';

import { useState, useEffect, useRef } from 'react';
import { Cpu, Maximize, Play, Square, Activity } from 'lucide-react';

export default function GpuTest() {
  const [gpuInfo, setGpuInfo] = useState<any>(null);
  const [fps, setFps] = useState(0);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const rafId = useRef<number>(0);
  
  // FPS calculation variables
  const frameCount = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    // Initialize WebGL and extract GPU Info
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (gl) {
        const webgl = gl as WebGLRenderingContext;
        glRef.current = webgl;
        
        // Extract GPU Info
        const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown Vendor';
        const renderer = debugInfo ? webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown GPU';
        
        setGpuInfo({
          vendor,
          renderer,
          version: webgl.getParameter(webgl.VERSION),
          shadingLanguage: webgl.getParameter(webgl.SHADING_LANGUAGE_VERSION),
          maxTextureSize: webgl.getParameter(webgl.MAX_TEXTURE_SIZE),
        });
        
        // Set basic clear color
        webgl.clearColor(0.1, 0.1, 0.15, 1.0);
        webgl.clear(webgl.COLOR_BUFFER_BIT);
      } else {
        setGpuInfo({ error: 'WebGL is not supported on this browser.' });
      }
    }
    
    return () => stopStressTest();
  }, []);

  const renderLoop = (time: number) => {
    const gl = glRef.current;
    if (!gl) return;

    // Calculate FPS
    frameCount.current++;
    if (time - lastTime.current >= 1000) {
      setFps(Math.round((frameCount.current * 1000) / (time - lastTime.current)));
      frameCount.current = 0;
      lastTime.current = time;
    }

    // Very basic WebGL "stress test" visual (changing clear colors rapidly based on sine wave)
    const r = (Math.sin(time * 0.005) + 1) / 2;
    const g = (Math.sin(time * 0.003) + 1) / 2;
    const b = (Math.sin(time * 0.007) + 1) / 2;
    
    gl.clearColor(r * 0.5, g * 0.5, b * 0.8, 1.0); // Keep it darkish blue
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Simulate heavy calculation to drop FPS
    for (let i = 0; i < 5000000; i++) {
      Math.sqrt(i) * Math.sin(i);
    }

    rafId.current = requestAnimationFrame(renderLoop);
  };

  const startStressTest = () => {
    setIsStressTesting(true);
    frameCount.current = 0;
    lastTime.current = performance.now();
    rafId.current = requestAnimationFrame(renderLoop);
  };

  const stopStressTest = () => {
    setIsStressTesting(false);
    cancelAnimationFrame(rafId.current);
    setFps(0);
    // Reset canvas color
    const gl = glRef.current;
    if (gl) {
      gl.clearColor(0.1, 0.1, 0.15, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#f5f3ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Cpu size={32} color="#8b5cf6" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>GPU & WebGL Tester</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Detect graphics card details and perform a basic 60-FPS render stress test.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Maximize size={20} color="#8b5cf6" /> Graphics Card Details
          </h3>
          
          {!gpuInfo ? (
            <div style={{ color: '#94a3b8' }}>Detecting GPU...</div>
          ) : gpuInfo.error ? (
            <div style={{ color: '#ef4444' }}>{gpuInfo.error}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <InfoRow label="Renderer (VGA/GPU)" value={gpuInfo.renderer} highlight />
              <InfoRow label="Vendor" value={gpuInfo.vendor} />
              <InfoRow label="WebGL Version" value={gpuInfo.version} />
              <InfoRow label="Shading Language" value={gpuInfo.shadingLanguage} />
              <InfoRow label="Max Texture Size" value={`${gpuInfo.maxTextureSize} px`} />
            </div>
          )}
        </div>
      </div>

      {/* Stress Test Area */}
      <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#0f172a', border: '2px solid #334155' }}>
        <canvas ref={canvasRef} width={800} height={300} style={{ width: '100%', height: '100%', display: 'block' }} />
        
        {/* Overlay UI */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: isStressTesting ? 'transparent' : 'rgba(15,23,42,0.8)', transition: 'background-color 0.3s' }}>
          
          {isStressTesting ? (
            <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '12px', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={24} color={fps >= 50 ? '#22c55e' : fps >= 30 ? '#f59e0b' : '#ef4444'} />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase' }}>Current FPS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{fps} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>fps</span></div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Cpu size={48} color="#64748b" style={{ margin: '0 auto 16px' }} />
              <div style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '1.1rem' }}>Engine Ready</div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '300px', margin: '8px auto 0' }}>Click start to render heavy calculations and check your GPU frame rate limits.</p>
            </div>
          )}
          
          <button 
            onClick={isStressTesting ? stopStressTest : startStressTest}
            style={{ 
              position: 'absolute', bottom: '24px',
              padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', border: 'none',
              backgroundColor: isStressTesting ? 'rgba(239,68,68,0.9)' : '#8b5cf6',
              color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'all 0.2s'
            }}
          >
            {isStressTesting ? <><Square size={18} fill="currentColor" /> Stop Render Test</> : <><Play size={18} fill="currentColor" /> Start Stress Test</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
      <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{label}</span>
      <span style={{ color: highlight ? '#8b5cf6' : '#0f172a', fontWeight: highlight ? 800 : 600, fontSize: highlight ? '1rem' : '0.9rem', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}
