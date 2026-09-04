import React, { useState, useEffect } from 'react';
import { History, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ImportHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/import/history');
      setHistory(res.data.data || []);
    } catch (err) {
      console.error('Failed to load import history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this import audit record?')) return;
    try {
      await api.delete(`/import/${id}`);
      fetchHistory();
    } catch (err) {
      alert('Failed to delete history record');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem' }}>Statement & File Ingestion History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Audit trail of uploaded statements, parsed receipts, and transaction extraction counts
        </p>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Format</th>
              <th>File Size</th>
              <th>Import Timestamp</th>
              <th>Transactions Extracted</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={18} color="var(--primary-500)" />
                    <strong>{item.fileName}</strong>
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}
                  >
                    {item.fileType}
                  </span>
                </td>
                <td>{(item.fileSize / 1024).toFixed(1)} KB</td>
                <td>{new Date(item.importedAt).toLocaleString('en-IN')}</td>
                <td>
                  <span style={{ fontWeight: 700 }}>{item.transactionCount} txns</span>
                </td>
                <td>
                  <span className="badge-income stat-badge">
                    <CheckCircle2 size={13} /> Completed
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn btn-danger btn-icon btn-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  No statement files imported yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportHistory;
