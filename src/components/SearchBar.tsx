'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ placeholder = "Search tools...", value, onChange }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px', marginBottom: '30px' }}>
      <div style={{
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <Search size={18} />
      </div>
      <input 
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 12px 12px 40px',
          borderRadius: '10px',
          border: '1px solid var(--card-border)',
          background: 'var(--background)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
        className="search-input"
      />
      <style jsx>{`
        .search-input:focus {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.05);
        }
      `}</style>
    </div>
  );
}
