'use client';

import { useState, useEffect, useRef } from 'react';
import { Microchip, Server, Activity, Play, Square, AlertCircle } from 'lucide-react';

export default function CpuTest() {
  const [hardware, setHardware] = useState<{ cores: number | string, memory: number | string }>({ cores: '?', memory: '?' });
  const [isTesting, setIsTesting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeMs, setTimeMs] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Detect hardware specs
    const cores = navigator.hardwareConcurrency || 'Unknown';
    const memory = (navigator as any).deviceMemory || 'Unknown';
    setHardware({ cores, memory });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const startBenchmark = () => {
    setIsTesting(true);
    setScore(null);
    setTimeMs(null);
    setProgress(0);

    // Create an inline Web Worker so it doesn't freeze the browser UI
    const workerCode = `
      self.onmessage = function(e) {
        const iterations = 50000000; // 50 million calculations
        const start = performance.now();
        let dummy = 0;
        
        // Report progress periodically
        for (let i = 0; i < iterations; i++) {
          dummy += Math.sqrt(i) * Math.sin(i % 100);
          
          if (i % 1000000 === 0) {
            self.postMessage({ type: 'progress', percent: Math.round((i / iterations) * 100) });
          }
        }
        
        const end = performance.now();
        const duration = end - start;
        // Arbitrary score calculation based on speed
        const finalScore = Math.round(100000000 / duration);
        
        self.postMessage({ type: 'done', duration, score: finalScore });
      }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        setProgress(e.data.percent);
      } else if (e.data.type === 'done') {
        setScore(e.data.score);
        setTimeMs(Math.round(e.data.duration));
        setProgress(100);
        setIsTesting(false);
        worker.terminate();
      }
    };

    worker.postMessage('start');
  };

  const stopBenchmark = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    setIsTesting(false);
    setProgress(0);
  };

  const getScoreRating = (s: number) => {
    if (s > 2500) return { text: 'Blazing Fast (High-End CPU)', color: '#22c55e' };
    if (s > 1500) return { text: 'Great (Mid-Range CPU)', color: '#3b82f6' };
    if (s > 800) return { text: 'Good (Office/Standard PC)', color: '#f59e0b' };
    return { text: 'Slow (Entry-level / Old CPU)', color: '#ef4444' };
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Microchip size={32} color="#3b82f6" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>CPU Benchmark & Specs</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Check your processor power and RAM capacity.</p>
      </div>

      {/* System Specs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '12px' }}>
            <Server size={24} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CPU Cores (Logical)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>{hardware.cores} Cores</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '12px' }}>
            <Activity size={24} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Est. RAM Capacity</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>
              {hardware.memory !== 'Unknown' ? `~${hardware.memory} GB` : 'Hidden'}
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Area */}
      <div style={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', padding: '32px', borderRadius: '20px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>Performance Benchmark</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
          This test runs 50 million complex math operations. Faster CPUs complete it in less time, resulting in a higher score.
        </p>

        {/* Score Display */}
        <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          {isTesting ? (
            <div style={{ width: '100%', maxWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                <span>Calculating...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.2s linear' }} />
              </div>
            </div>
          ) : score !== null ? (
            <div style={{ animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginTop: '8px' }}>Completed in {timeMs} ms</div>
              <div style={{ marginTop: '12px', display: 'inline-block', padding: '6px 16px', borderRadius: '20px', backgroundColor: `${getScoreRating(score).color}20`, color: getScoreRating(score).color, fontWeight: 800, fontSize: '0.85rem' }}>
                {getScoreRating(score).text}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#cbd5e1' }}>0000</div>
          )}
        </div>

        <button 
          onClick={isTesting ? stopBenchmark : startBenchmark}
          style={{ 
            marginTop: '24px', padding: '16px 32px', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '10px', border: 'none',
            backgroundColor: isTesting ? '#ef4444' : '#1e293b',
            color: '#fff', boxShadow: isTesting ? '0 4px 15px rgba(239,68,68,0.3)' : '0 4px 15px rgba(30,41,59,0.3)', transition: 'all 0.2s'
          }}
        >
          {isTesting ? <><Square size={20} fill="currentColor" /> Stop Benchmark</> : <><Play size={20} fill="currentColor" /> Start CPU Test</>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <AlertCircle size={20} color="#64748b" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
          <strong>Note:</strong> Browsers restrict memory detection for privacy reasons. The displayed RAM is usually capped (e.g., 8GB max) even if your PC has more. CPU Core count shows logical processors (threads).
        </p>
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
