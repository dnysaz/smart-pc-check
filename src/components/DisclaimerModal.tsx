'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAgreed = localStorage.getItem('disclaimer_agreed');
    if (!hasAgreed) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('disclaimer_agreed', 'true');
    setIsOpen(false);
  };

  const handleDisagree = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '500px',
        width: '100%',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid #eaeaea',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#fffbeb',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <ShieldAlert style={{ color: '#d97706' }} size={32} />
        </div>
        
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '16px'
        }}>
          Disclaimer & Terms of Use
        </h2>
        
        <div style={{
          color: '#666666',
          lineHeight: '1.6',
          marginBottom: '32px',
          fontSize: '15px'
        }}>
          <p style={{ marginBottom: '12px' }}>
            By accessing and using <strong>SmartPCChecker</strong>, you acknowledge and agree that any actions taken based on the information provided are at your own risk and responsibility.
          </p>
          <p style={{ marginBottom: '16px' }}>
            All system checks and diagnostic results are for <strong>general informational purposes only</strong>. We do not guarantee 100% accuracy, and results may vary depending on specific hardware configurations.
          </p>
          <p style={{ 
            fontSize: '13px', 
            borderTop: '1px solid #f3f4f6', 
            paddingTop: '16px',
            color: '#888888'
          }}>
            Do you agree to these terms and wish to proceed?
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'row'
        }}>
          <button
            onClick={handleAgree}
            style={{
              flex: 1,
              backgroundColor: '#0070f3',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0060d3'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0070f3'}
          >
            I Agree
          </button>
          <button
            onClick={handleDisagree}
            style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              border: '1px solid #e5e7eb',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            Disagree
          </button>
        </div>
      </div>
    </div>
  );
}
