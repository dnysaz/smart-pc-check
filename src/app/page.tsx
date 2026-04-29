import SystemInfo from '@/components/SystemInfo';

export default function Home() {
  return (
    <main style={{ padding: '60px 5%', width: '100%', margin: '0' }}>
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#1e293b', marginBottom: '16px', letterSpacing: '-1px' }}>
          Welcome to <span style={{ color: '#0070f3' }}>Smart PC Checker</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.25rem', maxWidth: '700px', lineHeight: '1.6' }}>
          Your all-in-one professional diagnostic suite. Monitor hardware health, test peripherals, and analyze system performance directly from your browser, powered with AI Analyzer.
        </p>
      </div>

      <SystemInfo />
    </main>
  );
}
