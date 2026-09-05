import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, TrendingUp, DollarSign } from 'lucide-react';
import api from '../services/api';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const res = await api.get('/income?limit=100');
      setIncomes(res.data.data || []);
    } catch (err) {
      console.error('Failed to load income:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      source: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inc) => {
    setEditingId(inc._id || inc.id);
    setFormData({
      source: inc.source,
      amount: inc.amount,
      date: new Date(inc.date).toISOString().split('T')[0],
      description: inc.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/income/${editingId}`, formData);
      } else {
        await api.post('/income', formData);
      }
      setIsModalOpen(false);
      fetchIncome();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving income stream');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    try {
      await api.delete(`/income/${id}`);
      fetchIncome();
    } catch (err) {
      alert('Failed to delete income record');
    }
  };

  const totalInflow = incomes.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Income Streams & Inflows</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage salaries, dividends, consulting payments, and all cash inflows
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Income Stream</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Recorded Inflow</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
              ₹{totalInflow.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <span className="badge-income stat-badge">
          {incomes.length} Streams Active
        </span>
      </div>

      {/* Income Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Income Source / Entity</th>
              <th>Notes</th>
              <th>Source Type</th>
              <th>Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((inc) => (
              <tr key={inc._id}>
                <td>{new Date(inc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>
                  <strong>{inc.source}</strong>
                </td>
                <td>{inc.description || '—'}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {inc.isImported ? (inc.sourceFile?.fileName || 'Imported') : 'Manual'}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                  +₹{inc.amount.toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenEdit(inc)}
                    className="btn btn-secondary btn-icon btn-sm"
                    style={{ marginRight: '0.5rem' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(inc._id || inc.id)}
                    className="btn btn-danger btn-icon btn-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {incomes.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No income records found. Click "Add Income Stream" to record your salary or inflow.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingId ? 'Edit Income Record' : 'Record New Income'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Source / Payer Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Tech Corp, Freelance Project, Dividend"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    placeholder="40000.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date Received</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Remarks</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Optional note"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingId ? 'Save Changes' : 'Record Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
