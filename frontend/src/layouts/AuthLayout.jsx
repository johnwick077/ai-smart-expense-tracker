import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1E1B4B 0%, #0B0F19 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-logo" style={{ width: '44px', height: '44px' }}>
            <Sparkles size={24} />
          </div>
          <span className="brand-title" style={{ fontSize: '1.5rem' }}>
            SmartExpense AI
          </span>
        </Link>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Automate Receipt & Statement Ingestion with Gemini AI
        </p>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(30, 41, 59, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2.5rem'
        }}
      >
        <Outlet />
      </div>

      <div style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        (c) 2026 AI Smart Expense Tracker • Bank-Grade Security
      </div>
    </div>
  );
};

export default AuthLayout;
