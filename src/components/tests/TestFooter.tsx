import Link from 'next/link';

interface TestFooterProps {
  currentTest: string;
}

export default function TestFooter({ currentTest }: TestFooterProps) {
  const tests = [
    { name: 'Keyboard', href: '/tests/keyboard' },
    { name: 'Screen', href: '/tests/screen' },
    { name: 'Microphone', href: '/tests/mic' },
    { name: 'Speaker', href: '/tests/speaker' },
  ];

  const others = tests.filter(t => t.name.toLowerCase() !== currentTest.toLowerCase());

  return (
    <div style={{ 
      marginTop: '60px', 
      paddingTop: '30px', 
      borderTop: '1px solid var(--card-border)',
      textAlign: 'center'
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
        Want to check another hardware?
      </p>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {others.map(test => (
          <Link 
            key={test.href} 
            href={test.href}
            style={{
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              fontWeight: 500,
              textDecoration: 'underline'
            }}
          >
            Try {test.name} Test →
          </Link>
        ))}
      </div>
    </div>
  );
}
