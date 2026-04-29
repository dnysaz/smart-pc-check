'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, DownloadCloud, MessageSquare, Wrench, HeartHandshake, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Hardware Check', href: '/tests', icon: <ShieldCheck size={20} /> },
    { name: 'Download Center', href: '/downloads', icon: <DownloadCloud size={20} /> },
    { name: 'Ask AI', href: '/ask-ai', icon: <MessageSquare size={20} /> },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={20} style={{ color: '#000' }} />
          <span style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#000' }}>
            SmartPcChecker
          </span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileOpen ? 'mobile-open' : ''}`} 
        onClick={() => setIsMobileOpen(false)} 
      />

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : 'mobile-closed'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <Wrench size={24} style={{ color: '#000' }} />
          <span style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.5px', color: '#000' }}>
            SmartPcChecker.com
          </span>
        </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                background: isActive ? 'rgba(0, 112, 243, 0.05)' : 'transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
              }}
              className="sidebar-link"
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
        
        {/* Support Us Box */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: '12px',
          background: 'linear-gradient(145deg, #eff6ff, #dbeafe)',
          border: '1px solid #bfdbfe',
          textAlign: 'center',
        }}>
          <HeartHandshake size={28} color="#3b82f6" style={{ margin: '0 auto 8px', animation: 'pulse 2s infinite' }} />
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
            Keep this tool free of ads!
          </div>
          <p style={{ fontSize: '0.75rem', color: '#1d4ed8', marginBottom: '12px', lineHeight: 1.4 }}>
            If you find this useful, consider supporting our work.
          </p>
          <a 
            href={process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://saweria.co/yourlink'} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              width: '100%',
              padding: '8px 0',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Support Us
          </a>
        </div>
      </nav>

      <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--card-border)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          SmartPCChecker v1.0.0
        </div>
      </div>

      <style jsx>{`
        .sidebar-link:hover {
          background: rgba(0, 0, 0, 0.03);
          color: var(--foreground) !important;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </aside>
    </>
  );
}
