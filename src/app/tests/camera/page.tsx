import CameraTest from '@/components/tests/CameraTest';
import TestFooter from '@/components/tests/TestFooter';

export default function CameraPage() {
  return (
    <main style={{ padding: '60px 5%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <CameraTest />
        <TestFooter currentTest="Camera" />
      </div>
    </main>
  );
}
