'use client';

import { useState } from 'react';
import ActionCard from '@/components/ActionCard';
import SearchBar from '@/components/SearchBar';
import { tools } from '@/data/tools';
import { Keyboard, Monitor, Mic, Volume2, ShieldCheck, Camera, Usb, Fingerprint, MousePointer2, Gamepad2, Battery, Wifi, Cpu, Compass, Microchip } from 'lucide-react';

export default function TestsMenuPage() {
  const [search, setSearch] = useState('');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'keyboard': return <Keyboard size={24} />;
      case 'monitor': return <Monitor size={24} />;
      case 'mic': return <Mic size={24} />;
      case 'volume2': return <Volume2 size={24} />;
      case 'camera': return <Camera size={24} />;
      case 'usb': return <Usb size={24} />;
      case 'fingerprint': return <Fingerprint size={24} />;
      case 'mousepointer': return <MousePointer2 size={24} />;
      case 'gamepad': return <Gamepad2 size={24} />;
      case 'battery': return <Battery size={24} />;
      case 'wifi': return <Wifi size={24} />;
      case 'cpu': return <Cpu size={24} />;
      case 'compass': return <Compass size={24} />;
      case 'microchip': return <Microchip size={24} />;
      default: return <ShieldCheck size={24} />;
    }
  };

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ padding: '40px 5%', width: '100%', margin: '0', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '8px' }}>Hardware Diagnostic Suite</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select a specific tool to begin your hardware verification.
        </p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search hardware tests..." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredTools.map((tool) => (
          <ActionCard 
            key={tool.id}
            title={tool.name}
            desc={tool.desc}
            href={tool.href}
            icon={getIcon(tool.icon)}
            status={tool.status}
          />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No tests found matching "{search}"
        </div>
      )}
    </main>
  );
}
