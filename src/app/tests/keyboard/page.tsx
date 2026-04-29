import KeyboardTest from '@/components/tests/KeyboardTest';
import TestFooter from '@/components/tests/TestFooter';

export default function KeyboardPage() {
  return (
    <main style={{ padding: '20px', width: '100%', minHeight: 'calc(100vh - 40px)' }}>
      <KeyboardTest />
      <div style={{ marginTop: '40px' }}>
        <TestFooter currentTest="Keyboard" />
      </div>
    </main>
  );
}
