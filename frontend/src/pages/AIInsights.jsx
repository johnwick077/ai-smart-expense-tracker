import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, FileText, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const AIInsights = () => {
  const [analysis, setAnalysis] = useState('');
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    fetchInitialInsights();
  }, []);

  const fetchInitialInsights = async () => {
    try {
      const [suggRes, analyzeRes] = await Promise.all([
        api.post('/ai/suggestions'),
        api.post('/ai/analyze')
      ]);
      setSuggestions(suggRes.data.data || []);
      setAnalysis(analyzeRes.data.data?.analysis || '');
    } catch (err) {
      console.error('Error fetching initial insights:', err);
    }
  };

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const now = new Date();
      const res = await api.post('/ai/monthly-summary', {
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      setSummary(res.data.data?.summary || '');
    } catch (err) {
      alert('Failed to generate monthly summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await api.post('/ai/analyze');
      setAnalysis(res.data.data?.analysis || '');
    } catch (err) {
      alert('Failed to analyze spending');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>AI Financial Intelligence Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gemini AI automated executive reports, anomaly audits, and saving suggestions
          </p>
        </div>

        <button
          onClick={handleRefreshAnalysis}
          disabled={loadingAnalysis}
          className="btn btn-secondary"
        >
          <Sparkles size={16} color="var(--accent-purple)" />
          <span>{loadingAnalysis ? 'Analyzing...' : 'Refresh AI Analysis'}</span>
        </button>
      </div>

      {/* AI Spending Analysis Card */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: 'var(--shadow-glow)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>AI Spending Behavior Analysis</h3>
        </div>

        <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {analysis || 'Analyzing verified transactions...'}
        </div>
      </div>

      {/* Monthly Summary Generator Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={22} color="var(--primary-500)" />
            <h3 style={{ fontSize: '1.2rem' }}>Monthly Financial Executive Summary</h3>
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={loadingSummary}
            className="btn btn-primary btn-sm"
          >
            {loadingSummary ? (
              <>
                <Loader2 size={15} className="spinner" />
                <span>Compiling Report...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate AI Monthly Summary</span>
              </>
            )}
          </button>
        </div>

        {summary ? (
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              lineHeight: 1.7,
              fontSize: '0.95rem',
              whiteSpace: 'pre-line'
            }}
          >
            {summary}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Click "Generate AI Monthly Summary" to synthesize income, expenses, category velocity, and budget health into a formatted executive digest.
          </p>
        )}
      </div>

      {/* Actionable Saving Suggestions */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lightbulb size={20} color="var(--warning)" />
          <span>Actionable Saving Suggestions</span>
        </h3>

        <div className="grid-2">
          {suggestions.map((item, index) => (
            <div
              key={index}
              className="card"
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1rem' }}>Optimization in {item.category}</strong>
                <span className="badge-warning stat-badge">
                  Potential: ₹{item.potentialSavings.toLocaleString('en-IN')}/mo
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {item.tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
