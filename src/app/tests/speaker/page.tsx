import SpeakerTest from '@/components/tests/SpeakerTest';
import TestFooter from '@/components/tests/TestFooter';

export default function SpeakerPage() {
  return (
    <main style={{ padding: '60px 5%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <SpeakerTest />
        <TestFooter currentTest="Speaker" />
      </div>
    </main>
  );
}
