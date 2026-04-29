'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { downloads, DownloadItem } from '@/data/downloads';
import { Disc, Cpu, Package, Activity, Terminal, FileText, GraduationCap, ExternalLink, ShieldCheck, Wrench, Box, Globe, MessageCircle, Gamepad2, PlayCircle, RefreshCcw, BookOpen, Download, Palette } from 'lucide-react';

export default function DownloadsPage() {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string, visible: boolean }>({ message: '', visible: false });

  const showToast = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'OS': return <Disc size={18} />;
      case 'DRIVER': return <Cpu size={18} />;
      case 'MAINTENANCE': return <Wrench size={18} />;
      case 'DESIGN & 3D': return <Box size={18} />;
      case 'UTILITY APP': return <Activity size={18} />;
      case 'DEV APP': return <Terminal size={18} />;
      case 'OFFICE APP': return <FileText size={18} />;
      case 'SCHOOL APP': return <GraduationCap size={18} />;
      case 'BROWSER': return <Globe size={18} />;
      case 'COMMUNICATION': return <MessageCircle size={18} />;
      case 'GAMING': return <Gamepad2 size={18} />;
      case 'MEDIA PLAYER': return <PlayCircle size={18} />;
      case 'CONVERTER TOOLS': return <RefreshCcw size={18} />;
      case 'PDF TOOLS': return <BookOpen size={18} />;
      case 'RGB CONTROL': return <Palette size={18} />;
      default: return <Package size={18} />;
    }
  };

  const filteredDownloads = downloads.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(filteredDownloads.map(d => d.category)));

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (next.size >= 5) {
        showToast("Maximum 5 items allowed per batch.");
        return;
      }
      next.add(id);
    }
    setSelectedIds(next);
  };

  const openSelected = () => {
    const selectedItems = downloads.filter(d => selectedIds.has(d.id));
    if (selectedItems.length > 3) {
      showToast("Note: Your browser might block multiple pop-ups.");
    }
    selectedItems.forEach(item => {
      window.open(item.link, '_blank');
    });
  };

  return (
    <main style={{ padding: '40px 5%', width: '100%', margin: '0', paddingBottom: '100px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Resource Center</h1>
          <span style={{ 
            backgroundColor: '#0070f3', 
            color: 'white', 
            padding: '2px 10px', 
            borderRadius: '20px', 
            fontSize: '0.8rem', 
            fontWeight: 700,
            boxShadow: '0 4px 10px rgba(0, 112, 243, 0.3)'
          }}>
            {downloads.length} Links
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Direct access to official manufacturer downloads. Verified for security and authenticity.
          </p>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search ISOs, drivers, or apps..." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {categories.map(category => (
          <section key={category}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--card-border)'
            }}>
              <span style={{ color: 'var(--accent-cyan)' }}>{getIcon(category)}</span>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{category}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--card-border)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
              {filteredDownloads.filter(d => d.category === category).map((item) => (
                <DownloadRow 
                  key={item.id} 
                  item={item} 
                  icon={getIcon(item.category)} 
                  isSelected={selectedIds.has(item.id)}
                  onToggle={() => toggleSelect(item.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredDownloads.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          No resources found matching "{search}"
        </div>
      )}

      {/* Floating Action Bar for Bulk Downloads */}
      {selectedIds.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1a1a1a',
          padding: '12px 24px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          zIndex: 100,
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#0070f3', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
              <span style={{ margin: 'auto' }}>{selectedIds.size}</span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Apps selected</span>
          </div>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setSelectedIds(new Set())}
              style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Clear
            </button>
            <button 
              onClick={openSelected}
              style={{ 
                backgroundColor: '#0070f3', 
                color: 'white', 
                border: 'none', 
                padding: '8px 20px', 
                borderRadius: '10px', 
                fontWeight: 600, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} /> Open All Links
            </button>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: toast.visible ? '24px' : '-400px',
        backgroundColor: '#ffffff',
        border: '1px solid #eaeaea',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <div style={{ color: '#0070f3' }}>
          <ShieldCheck size={20} />
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a1a' }}>{toast.message}</span>
      </div>
    </main>
  );
}

function DownloadRow({ item, icon, isSelected, onToggle }: { item: DownloadItem, icon: React.ReactNode, isSelected: boolean, onToggle: () => void }) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        background: isSelected ? '#f0f7ff' : '#fff', 
        alignItems: 'center',
        padding: '0 24px',
        transition: 'all 0.15s ease'
      }} 
      className="download-row-container"
    >
      <input 
        type="checkbox" 
        checked={isSelected} 
        onChange={onToggle}
        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0070f3' }}
      />

      <a 
        href={item.link} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ flex: 1, display: 'block', textDecoration: 'none' }}
        className="download-row-link"
      >
        <div style={{ 
          padding: '16px 0 16px 20px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="download-row">
          
          {/* Left Side: Icon and Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 2 }}>
            <div style={{ color: 'var(--text-muted)', display: 'flex' }}>{icon}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--foreground)' }}>{item.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }} className="row-desc">{item.description}</span>
            </div>
          </div>

          {/* Center: Version/Stats */}
          <div style={{ flex: 1, display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
               <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Version</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--foreground)' }}>{item.version}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
               <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Status</span>
               <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> {item.stats}
               </span>
            </div>
          </div>

          {/* Right Side: Link */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0070f3' }}>Official Link</span>
            <ExternalLink size={14} color="#0070f3" />
          </div>
        </div>
      </a>
      
      <style jsx>{`
        .download-row-container:hover {
          background: ${isSelected ? '#f0f7ff' : '#f9fafb'};
        }
        .download-row-container:not(:last-child) {
          border-bottom: 1px solid var(--card-border);
        }
        @media (max-width: 768px) {
          .row-desc { display: none; }
          .download-row { padding: 12px 16px; }
        }
      `}</style>
    </div>
  );
}
