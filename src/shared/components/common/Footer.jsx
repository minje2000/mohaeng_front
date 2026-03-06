// src/shared/components/common/Footer.jsx
export default function Footer() {
  return (
    <footer
      style={{
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        color: '#111',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      © 2026 MOHAENG. All rights reserved.
    </footer>
  );
}