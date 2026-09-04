import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertTriangle,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Filter
} from 'lucide-react';
import api from '../services/api';

const PREDEFINED_CATEGORIES = [
  'Food', 'Hotel', 'Shopping', 'Transport', 'Bills',
  'Entertainment', 'Healthcare', 'Education', 'Rent', 'Travel', 'Salary', 'Other'
];

const ImportReview = () => {
  const navigate = useNavigate();
  const [stagedData, setStagedData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('stagedImport');
    if (!raw) {
      navigate('/import');
      return;
    }

    try {
      const data = JSON.parse(raw);
      setStagedData(data);
      const txnsWithId = (data.transactions || []).map((t, idx) => ({
        ...t,
        tempId: idx
      }));
      setTransactions(txnsWithId);

      // Select all non-duplicate transactions by default
      const nonDupIds = new Set(
        txnsWithId.filter(t => !t.isDuplicate).map(t => t.tempId)
      );
      setSelectedIds(nonDupIds);
    } catch {
      navigate('/import');
    }
  }, [navigate]);

  const handleToggleSelect = (tempId) => {
    const next = new Set(selectedIds);
    if (next.has(tempId)) {
      next.delete(tempId);
    } else {
      next.add(tempId);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(transactions.map(t => t.tempId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleCategoryChange = (tempId, newCat) => {
    setTransactions(prev =>
      prev.map(t => (t.tempId === tempId ? { ...t, category: newCat } : t))
    );
  };

  const handleTypeChange = (tempId, newType) => {
    setTransactions(prev =>
      prev.map(t => (t.tempId === tempId ? { ...t, type: newType } : t))
    );
  };

  const handleDelete = (tempId) => {
    setTransactions(prev => prev.filter(t => t.tempId !== tempId));
    const next = new Set(selectedIds);
    next.delete(tempId);
    setSelectedIds(next);
  };

  const handleCommit = async () => {
    const toSave = transactions.filter(t => selectedIds.has(t.tempId));
    if (toSave.length === 0) {
      alert('Please select at least one transaction to import.');
      return;
    }

    setCommitting(true);
    try {
      const res = await api.post('/import/process', {
        fileName: stagedData.fileName,
        fileType: stagedData.fileType,
        fileSize: stagedData.fileSize,
        transactions: toSave
      });

      if (res.data.success) {
        sessionStorage.removeItem('stagedImport');
        alert(res.data.message);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save confirmed transactions.');
    } finally {
      setCommitting(false);
    }
  };

  if (!stagedData) return null;

  const duplicatesCount = transactions.filter(t => t.isDuplicate).length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            onClick={() => navigate('/import')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            <span>Upload Another File</span>
          </button>
          <h1 style={{ fontSize: '1.75rem' }}>Review Extracted Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            File: <strong>{stagedData.fileName}</strong> • {transactions.length} items extracted • {duplicatesCount} duplicate warnings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              sessionStorage.removeItem('stagedImport');
              navigate('/import');
            }}
            className="btn btn-secondary"
          >
            Discard
          </button>
          <button
            onClick={handleCommit}
            disabled={committing || selectedIds.size === 0}
            className="btn btn-primary"
          >
            <span>{committing ? 'Saving to MongoDB...' : `Confirm & Save (${selectedIds.size})`}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicatesCount > 0 && (
        <div
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--warning)',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} />
            <span>
              <strong>{duplicatesCount} Potential Duplicate(s) Found:</strong> Transactions matching date, amount, and merchant already exist in your database.
            </span>
          </div>
          <button
            onClick={() => {
              const nonDup = new Set(transactions.filter(t => !t.isDuplicate).map(t => t.tempId));
              setSelectedIds(nonDup);
            }}
            className="btn btn-secondary btn-sm"
          >
            Deselect All Duplicates
          </button>
        </div>
      )}

      {/* Staging Review Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === transactions.length && transactions.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Date</th>
              <th>Narration / Merchant</th>
              <th>Type</th>
              <th>AI Suggested Category</th>
              <th>Amount (₹)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const isSelected = selectedIds.has(txn.tempId);
              return (
                <tr
                  key={txn.tempId}
                  style={{
                    backgroundColor: txn.isDuplicate ? 'rgba(245, 158, 11, 0.05)' : undefined
                  }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(txn.tempId)}
                    />
                  </td>
                  <td>{new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <strong>{txn.merchant}</strong>
                    {txn.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.description}</div>
                    )}
                    {txn.isDuplicate && (
                      <span
                        className="badge-warning"
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          marginTop: '0.25rem'
                        }}
                      >
                        <AlertTriangle size={12} /> Possible Duplicate
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                      value={txn.type}
                      onChange={(e) => handleTypeChange(txn.tempId, e.target.value)}
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', minWidth: '130px' }}
                        value={txn.category}
                        onChange={(e) => handleCategoryChange(txn.tempId, e.target.value)}
                      >
                        {PREDEFINED_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {txn.aiConfidence && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {Math.round(txn.aiConfidence * 100)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: txn.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(txn.tempId)}
                      className="btn btn-danger btn-icon btn-sm"
                      title="Discard row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportReview;
