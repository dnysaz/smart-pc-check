import Link from 'next/link';
import React from 'react';

interface ActionCardProps {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  status?: string;
  tag?: string;
  external?: boolean;
}

export default function ActionCard({ title, desc, href, icon, status, tag, external }: ActionCardProps) {
  const CardContent = (
    <div className="glass-card" style={{ 
      padding: '24px', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      borderRadius: '12px'
    }}>
      <div>
        <div style={{ color: 'var(--accent-cyan)', marginBottom: '16px' }}>{icon}</div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
      </div>
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        {status && (
          <span style={{ 
            fontSize: '0.7rem', 
            color: status === 'Online' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: status === 'Online' ? 'var(--accent-cyan)' : 'var(--text-muted)' 
            }}></span>
            {status}
          </span>
        )}
        {tag && (
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: 'bold', 
            color: 'var(--accent-purple)',
            border: '1px solid var(--accent-purple)',
            padding: '2px 6px',
            borderRadius: '4px',
            opacity: 0.8
          }}>
            {tag}
          </span>
        )}
      </div>
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        {CardContent}
      </a>
    );
  }

  return (
    <Link href={href} style={{ display: 'block' }}>
      {CardContent}
    </Link>
  );
}
