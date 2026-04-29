import MicTest from '@/components/tests/MicTest';
import TestFooter from '@/components/tests/TestFooter';

export default function MicPage() {
  return (
    <main style={{ padding: '60px 5%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <MicTest />
        <TestFooter currentTest="Microphone" />
      </div>
    </main>
  );
}
