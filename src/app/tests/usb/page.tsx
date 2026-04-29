import USBTest from '@/components/tests/USBTest';
import TestFooter from '@/components/tests/TestFooter';

export default function USBPage() {
  return (
    <main style={{ padding: '60px 5%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <USBTest />
        <TestFooter currentTest="USB" />
      </div>
    </main>
  );
}
