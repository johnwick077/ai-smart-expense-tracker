import React, { useState, useEffect } from 'react';
import { Plus, PiggyBank, DollarSign, Calendar, CheckCircle2, Trash2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: 0,
    deadline: '',
    description: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      setGoals(res.data.data || []);
    } catch (err) {
      console.error('Failed to load savings goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', formData);
      setIsCreateOpen(false);
      setFormData({ title: '', targetAmount: '', currentAmount: 0, deadline: '', description: '' });
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating savings goal');
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositGoal) return;

    try {
      const res = await api.post(`/goals/${depositGoal.id}/deposit`, { amount: depositAmount });
      const updated = res.data.data;

      // Trigger celebratory confetti if goal reached 100%
      if (updated.currentAmount >= updated.targetAmount) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setDepositGoal(null);
      setDepositAmount('');
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Deposit failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Savings Goals & Milestones</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Fund your dreams, vacation reserves, and emergency buffers
          </p>
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>New Savings Target</span>
        </button>
      </div>

      <div className="grid-2">
        {goals.map((goal) => {
          const isDone = goal.currentAmount >= goal.targetAmount;
          return (
            <div key={goal.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{goal.title}</h3>
                  {goal.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{goal.description}</p>
                  )}
                </div>
                {isDone ? (
                  <span className="badge-income stat-badge">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                ) : (
                  <span className="badge-info stat-badge">In Progress</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Accumulated: <strong>₹{goal.currentAmount.toLocaleString('en-IN')}</strong>
                </span>
                <span style={{ fontWeight: 700 }}>
                  Target: ₹{goal.targetAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, goal.percentage)}%`,
                    background: isDone ? 'var(--success)' : 'var(--accent-gradient)',
                    borderRadius: '9999px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {goal.deadline ? `Target Date: ${new Date(goal.deadline).toLocaleDateString('en-IN')}` : 'No deadline set'}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!isDone && (
                    <button
                      onClick={() => {
                        setDepositGoal(goal);
                        setDepositAmount('');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Deposit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="btn btn-danger btn-icon btn-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <PiggyBank size={48} color="var(--primary-500)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Savings Goals Created</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Set a target for a vacation, vehicle, emergency stash, or gadget purchase.
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            Create First Goal
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Create Savings Goal</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Europe Trip 2027, Emergency Stash"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    placeholder="100000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Stash (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Motivation</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Purpose of this target"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Deposit to {depositGoal.title}</h3>
              <button
                onClick={() => setDepositGoal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label className="form-label">Deposit Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
