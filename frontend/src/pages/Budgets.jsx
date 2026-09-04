import React, { useState, useEffect } from 'react';
import { Plus, Target, Sparkles, AlertTriangle, CheckCircle, ShieldAlert, X } from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  'Food', 'Hotel', 'Shopping', 'Transport', 'Bills',
  'Entertainment', 'Healthcare', 'Education', 'Rent', 'Travel', 'Other'
];

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const [formData, setFormData] = useState({
    category: 'Food',
    amount: ''
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets?month=${currentMonth}&year=${currentYear}`);
      setBudgets(res.data.data || []);
      setTotalBudget(res.data.totalBudget || 0);
      setTotalSpent(res.data.totalSpent || 0);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets', {
        ...formData,
        month: currentMonth,
        year: currentYear
      });
      setIsModalOpen(false);
      setFormData({ category: 'Food', amount: '' });
      fetchBudgets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      alert('Failed to delete budget');
    }
  };

  const handleGetAiRecommendations = async () => {
    try {
      setAiLoading(true);
      const res = await api.post('/ai/budget');
      setAiSuggestions(res.data.data);
    } catch (err) {
      alert('Failed to fetch AI budget recommendations');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiRecommendation = async (rec) => {
    try {
      await api.post('/budgets', {
        category: rec.category,
        amount: rec.recommendedAmount,
        month: currentMonth,
        year: currentYear
      });
      fetchBudgets();
      alert(`Applied AI Budget of ₹${rec.recommendedAmount} for ${rec.category}`);
    } catch (err) {
      alert('Error applying budget');
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Monthly Budget Planning</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Allocations & live expenditure tracking for {now.toLocaleString('default', { month: 'long' })} {currentYear}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleGetAiRecommendations}
            disabled={aiLoading}
            className="btn btn-secondary"
          >
            <Sparkles size={16} color="var(--accent-purple)" />
            <span>{aiLoading ? 'Analyzing...' : 'AI Budget Suggestions'}</span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Set New Budget</span>
          </button>
        </div>
      </div>

      {/* Top Overview Meter */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Overall Budget Utilization
          </span>
          <span style={{ fontWeight: 700 }}>
            ₹{totalSpent.toLocaleString('en-IN')} / ₹{totalBudget.toLocaleString('en-IN')}
          </span>
        </div>
        <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%`,
              background: totalSpent > totalBudget ? 'var(--danger)' : 'var(--primary-gradient)',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* AI Recommendations Panel (If fetched) */}
      {aiSuggestions && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.1rem' }}>Gemini AI Recommended Monthly Budgets</h3>
            </div>
            <button
              onClick={() => setAiSuggestions(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Based on standard financial balance allocations for monthly income of ₹{aiSuggestions.monthlyIncome.toLocaleString('en-IN')}:
          </p>

          <div className="grid-4">
            {aiSuggestions.recommendedBudgets.map((rec, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{rec.category}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-500)', marginBottom: '0.25rem' }}>
                  ₹{rec.recommendedAmount.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  {rec.reason}
                </div>
                {rec.category !== 'Savings Target' && (
                  <button
                    onClick={() => handleApplyAiRecommendation(rec)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Apply Budget
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budgets Cards Grid */}
      <div className="grid-4">
        {budgets.map((b) => {
          const isOver = b.status === 'Exceeded';
          const isWarning = b.status === 'Warning';
          return (
            <div key={b.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{b.category}</span>
                <span
                  className={isOver ? 'badge-expense stat-badge' : isWarning ? 'badge-warning stat-badge' : 'badge-income stat-badge'}
                >
                  {b.status}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Allotted: <strong>₹{b.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Spent: <strong>₹{b.spent.toLocaleString('en-IN')}</strong> ({b.percentage}%)
              </div>

              {/* Progress Bar */}
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, b.percentage)}%`,
                    background: isOver ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--success)',
                    borderRadius: '9999px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: b.remaining >= 0 ? 'var(--text-muted)' : 'var(--danger)' }}>
                  {b.remaining >= 0 ? `Safe Remaining: ₹${b.remaining.toLocaleString('en-IN')}` : `Deficit: -₹${Math.abs(b.remaining).toLocaleString('en-IN')}`}
                </span>
                <button
                  onClick={() => handleDelete(b.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', marginTop: '1rem' }}>
          <Target size={48} color="var(--primary-500)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Budgets Configured for This Month</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Set category limits to keep your spending controlled, or click "AI Budget Suggestions" for automatic recommendations.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            Set First Budget
          </button>
        </div>
      )}

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Set Monthly Budget</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSetBudget}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Limit Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  className="form-input"
                  placeholder="e.g. 8000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Budget Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
