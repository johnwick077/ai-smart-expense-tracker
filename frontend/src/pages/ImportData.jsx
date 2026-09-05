import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, Calendar } from 'lucide-react';
import api from '../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ImportData = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progressPhase, setProgressPhase] = useState('');
  const [error, setError] = useState('');
  
  // Statement billing cycle selector (default: current month and year)
  const [statementMonth, setStatementMonth] = useState(9); // September
  const [statementYear, setStatementYear] = useState(2026);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles && rejectedFiles.length > 0) {
      setError('Unsupported file type or file exceeds 10MB limit.');
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/json': ['.json']
    }
  });

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setProgressPhase('Validating & uploading statement...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('statementMonth', statementMonth);
      formData.append('statementYear', statementYear);

      setTimeout(() => setProgressPhase('Extracting rows & normalizing bank headers...'), 700);
      setTimeout(() => setProgressPhase('🧠 Gemini AI analyzing merchants, loans & predicting categories...'), 1400);

      const res = await api.post('/import/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        // Save extracted staging data to sessionStorage for review, including chosen cycle
        const stagePayload = {
          ...res.data.data,
          statementMonth,
          statementYear
        };
        sessionStorage.setItem('stagedImport', JSON.stringify(stagePayload));
        navigate('/import/review');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing file statement.');
    } finally {
      setUploading(false);
      setProgressPhase('');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Import Financial Statements & Ledger
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Drop your bank statement, export file, or ledger. Gemini AI automatically extracts dates, merchants, and smart categories for your review.
        </p>
      </div>

      {/* Statement Billing Cycle Selector */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '1.15rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#FFF' }}>
              Target Statement Month & Billing Period
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Select which month this statement represents (e.g. September 2026) for accurate loan & expense attribution
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={statementMonth}
            onChange={(e) => setStatementMonth(Number(e.target.value))}
            className="input-field"
            style={{ width: 'auto', minWidth: '140px', padding: '0.5rem 0.85rem' }}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>{name}</option>
            ))}
          </select>

          <select
            value={statementYear}
            onChange={(e) => setStatementYear(Number(e.target.value))}
            className="input-field"
            style={{ width: 'auto', minWidth: '100px', padding: '0.5rem 0.85rem' }}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Dropzone Box */}
      <div
        {...getRootProps()}
        className={`dropzone-box ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <UploadCloud size={32} />
        </div>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          {isDragActive ? 'Drop Statement File Here...' : 'Drag & Drop Your Statement File Here'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          or click to browse from your computer
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-surface)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          Supported: <strong>PDF</strong> • <strong>Excel (.xlsx, .xls)</strong> • <strong>CSV</strong> • <strong>TXT</strong> • <strong>JSON</strong> (Max 10MB)
        </div>
      </div>

      {/* Selected File Card & Actions */}
      {file && (
        <div
          className="card"
          style={{
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(30, 41, 59, 0.9)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{file.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {(file.size / 1024).toFixed(1)} KB • Ready for extraction
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setFile(null)}
              disabled={uploading}
              className="btn btn-secondary btn-sm"
            >
              Remove
            </button>
            <button
              onClick={handleUploadAndAnalyze}
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Extract & Categorize</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Uploading Phase Progress Meter */}
      {uploading && (
        <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--accent-purple)' }}>
            {progressPhase}
          </div>
          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: '75%',
                background: 'var(--accent-gradient)',
                borderRadius: '9999px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportData;
