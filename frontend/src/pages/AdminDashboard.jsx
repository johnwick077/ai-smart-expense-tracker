import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, FileSpreadsheet, Activity, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=50')
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user account and cascade all financial data?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <Shield size={24} color="var(--primary-500)" />
          <h1 style={{ fontSize: '1.75rem' }}>Administrator Console</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Platform oversight, user management, and system-wide ingestion volume
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">
            <span>REGISTERED USERS</span>
            <Users size={18} color="var(--primary-500)" />
          </div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-badge badge-info">{stats?.activeUsers || 0} Active Now</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>PROCESSED STATEMENTS</span>
            <FileSpreadsheet size={18} color="var(--accent-purple)" />
          </div>
          <div className="stat-value">{stats?.totalImportsCount || 0}</div>
          <div className="stat-badge badge-ai">Multi-format Ingestion</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>TOTAL EXPENSE RECORDS</span>
            <Activity size={18} color="var(--danger)" />
          </div>
          <div className="stat-value">{stats?.totalExpensesCount || 0}</div>
          <div className="stat-badge badge-expense">
            ₹{(stats?.platformVolumeSpent || 0).toLocaleString('en-IN')} volume
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>TOTAL INFLOW RECORDS</span>
            <Database size={18} color="var(--success)" />
          </div>
          <div className="stat-value">{stats?.totalIncomeCount || 0}</div>
          <div className="stat-badge badge-income">
            ₹{(stats?.platformVolumeInflow || 0).toLocaleString('en-IN')} volume
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card">
        <div className="card-title">
          <span>Platform User Accounts</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {users.length} accounts
          </span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Member Since</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: u.role === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: u.role === 'admin' ? '#A5B4FC' : 'var(--text-secondary)'
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={u.status === 'active' ? 'badge-income stat-badge' : 'badge-expense stat-badge'}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleStatus(u._id, u.status)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginRight: '0.5rem' }}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="btn btn-danger btn-icon btn-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
