import TouchscreenTest from '@/components/tests/TouchscreenTest';
import TestFooter from '@/components/tests/TestFooter';

export default function TouchscreenPage() {
  return (
    <main style={{ padding: '60px 5%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <TouchscreenTest />
        <TestFooter currentTest="Touchscreen" />
      </div>
    </main>
  );
}
