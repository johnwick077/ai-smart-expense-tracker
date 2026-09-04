import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  UploadCloud,
  Brain,
  ShieldCheck,
  CheckCircle2,
  PieChart
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(11, 15, 25, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-logo">
            <Sparkles size={20} />
          </div>
          <span className="brand-title" style={{ fontSize: '1.25rem' }}>SmartExpense AI</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '5rem 1.5rem 3rem',
          textAlign: 'center'
        }}
      >
        <div
          className="badge-ai"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}
        >
          <Sparkles size={16} />
          <span>Next-Gen MERN + Gemini AI Financial Assistant</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Stop Entering Transactions Manually.
          <br />
          Let AI Master Your Wealth.
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}
        >
          Drop your bank statements, spreadsheets, or receipts in <strong>PDF, Excel, CSV, TXT, or JSON</strong>.
          Gemini AI instantly extracts, normalizes, and categorizes your spending with 98% accuracy and exports multi-sheet Excel dashboards in seconds.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}>
            <span>Start Tracking Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem' }}>
            <span>Live Demo Sandbox</span>
          </Link>
        </div>

        {/* Supported Formats Pill Row */}
        <div
          style={{
            marginTop: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}
        >
          <span>Supported Statements:</span>
          {['PDF Bank Statements', 'Excel (.xlsx, .xls)', 'CSV Data', 'TXT Records', 'JSON Dumps'].map(fmt => (
            <span
              key={fmt}
              style={{
                background: 'var(--bg-card)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)'
              }}
            >
              {fmt}
            </span>
          ))}
        </div>
      </header>

      {/* Interactive AI Preview Demo */}
      <section style={{ maxWidth: '900px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(180deg, #1E293B 0%, #111827 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 0 35px rgba(99, 102, 241, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                HDFC_Bank_Statement.pdf (Parsed with Gemini 1.5 Flash)
              </span>
            </div>
            <span className="badge-income stat-badge">98% Auto-Categorized</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { desc: 'Swiggy Bangalore UPI/42491', merchant: 'Swiggy', amount: '₹450', cat: 'Food', conf: '98%' },
              { desc: 'Marriott Luxury Hotel Mumbai', merchant: 'Marriott', amount: '₹6,500', cat: 'Hotel', conf: '96%' },
              { desc: 'Amazon Retail India Online', merchant: 'Amazon', amount: '₹2,400', cat: 'Shopping', conf: '95%' },
              { desc: 'Uber India Commute Trip', merchant: 'Uber', amount: '₹350', cat: 'Transport', conf: '97%' }
            ].map((row, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{row.merchant}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{row.amount}</span>
                  <span className="badge-ai" style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                    {row.cat} ({row.conf})
                  </span>
                  <CheckCircle2 size={18} color="var(--success)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 6rem', padding: '0 1.5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>
          Engineered for Real Financial Control
        </h2>
        <div className="grid-4">
          <div className="card">
            <UploadCloud size={32} color="var(--primary-500)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Drag & Drop Ingestion</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Upload bank statements in any format. Automatic fuzzy column normalizer maps varying bank headers.
            </p>
          </div>

          <div className="card">
            <Brain size={32} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Gemini AI Categorizer</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Optimized batch processing categorizes merchants into standard groups with instant confidence scores.
            </p>
          </div>

          <div className="card">
            <FileSpreadsheet size={32} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Multi-Sheet Excel Export</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Export 7-sheet executive workbooks with formulas, category shares, budget health, and auto-styled columns.
            </p>
          </div>

          <div className="card">
            <ShieldCheck size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Duplicate Protection</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Intelligent duplicate detector alerts you to duplicate transactions within a ±24 hour window before saving.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}
      >
        AI Smart Expense Tracker • Built with MERN Stack + Google Gemini AI • © 2026
      </footer>
    </div>
  );
};

export default Landing;
