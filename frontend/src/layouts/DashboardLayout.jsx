import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Target,
  PiggyBank,
  PieChart,
  UploadCloud,
  FileCheck,
  History,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: TrendingDown },
    { label: 'Income', path: '/income', icon: TrendingUp },
    { label: 'Budgets', path: '/budgets', icon: Target },
    { label: 'Savings Goals', path: '/goals', icon: PiggyBank },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { divider: true },
    { label: 'Import Statement', path: '/import', icon: UploadCloud },
    { label: 'Review Staging', path: '/import/review', icon: FileCheck },
    { label: 'Import History', path: '/import/history', icon: History },
    { divider: true },
    { label: 'AI Insights', path: '/ai-insights', icon: Sparkles },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { divider: true },
    { label: 'Profile & Settings', path: '/profile', icon: User }
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Console', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="brand-title">SmartExpense AI</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Financial Ingestion Hub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            if (item.divider) {
              return <div key={`div-${index}`} className="nav-divider" />;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn btn-secondary btn-icon"
              style={{ display: 'none' }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/import')}
              className="btn btn-secondary btn-sm"
            >
              <UploadCloud size={15} />
              <span>Import File</span>
            </button>

            <button
              onClick={() => navigate('/expenses')}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} />
              <span>Add Expense</span>
            </button>

            <div
              onClick={() => navigate('/profile')}
              className="user-profile-badge"
            >
              <div className="avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Personal Member'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
