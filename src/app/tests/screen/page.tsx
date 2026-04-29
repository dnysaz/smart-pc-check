import ScreenTest from '@/components/tests/ScreenTest';
import TestFooter from '@/components/tests/TestFooter';

export default function ScreenPage() {
  return (
    <main style={{ padding: '60px 5%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <ScreenTest />
        <TestFooter currentTest="Screen" />
      </div>
    </main>
  );
}
