import Link from 'next/link';

export default function Header() {
  return (
    <header style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 5%',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      borderBottom: '1px solid var(--card-border)',
    }} className="glass">
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
          borderRadius: '4px'
        }}></div>
        <span style={{ fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          SCANMY<span style={{ color: 'var(--accent-cyan)' }}>RIG</span>
        </span>
      </Link>
      
      <nav style={{ display: 'flex', gap: '24px' }}>
        <Link href="/" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--foreground)' }}>Dashboard</Link>
        <Link href="/tests" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Tools</Link>
        <Link href="/downloads" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Resources</Link>
      </nav>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '12px' }}>
          v1.0.0
        </span>
      </div>
    </header>
  );
}
