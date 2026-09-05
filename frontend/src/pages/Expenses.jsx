import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, X, Download } from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  'Food', 'Hotel', 'Shopping', 'Transport', 'Bills',
  'Entertainment', 'Healthcare', 'Education', 'Rent', 'Travel', 'Loan', 'Other'
];

const PAYMENT_METHODS = ['UPI', 'Debit Card', 'ATM', 'Credit Card', 'Cash', 'Net Banking', 'Cheque', 'Other'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    merchant: '',
    description: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory, search]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = `/expenses?limit=100`;
      if (selectedCategory !== 'All') url += `&category=${selectedCategory}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      merchant: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingId(exp._id || exp.id);
    setFormData({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: new Date(exp.date).toISOString().split('T')[0],
      paymentMethod: exp.paymentMethod || 'Other',
      merchant: exp.merchant || '',
      description: exp.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      setIsModalOpen(false);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  return (
    <div>
      {/* Top Header & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Expense Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Record, filter, and audit all outflow transactions
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Manual Expense</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%' }}
              placeholder="Search expenses by title, merchant, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Expense Title / Payee</th>
              <th>Category</th>
              <th>Payment Mode</th>
              <th>Source</th>
              <th>Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <td>{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>
                  <strong>{exp.merchant || exp.title}</strong>
                  {exp.description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.description}</div>
                  )}
                </td>
                <td>
                  <span className="badge-ai" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                    {exp.category}
                  </span>
                </td>
                <td>{exp.paymentMethod}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {exp.isImported ? (exp.sourceFile?.fileName || 'Imported') : 'Manual'}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--danger)' }}>
                  -₹{exp.amount.toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    className="btn btn-secondary btn-icon btn-sm"
                    style={{ marginRight: '0.5rem' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp._id || exp.id)}
                    className="btn btn-danger btn-icon btn-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No expenses matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingId ? 'Edit Expense Record' : 'Record New Expense'}
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
                <label className="form-label">Expense Title / Merchant</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Swiggy, Uber, Electricity"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                    placeholder="450.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Transaction Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Optional memo or invoice details"
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
                  {editingId ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
