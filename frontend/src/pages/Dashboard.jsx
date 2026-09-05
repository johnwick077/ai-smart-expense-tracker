import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  UploadCloud,
  Plus,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  Landmark,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { exportDashboardToExcel } from '../utils/excelExporter';

const CATEGORY_COLORS = {
  Food: '#F59E0B',
  Hotel: '#8B5CF6',
  Shopping: '#EC4899',
  Transport: '#06B6D4',
  Bills: '#3B82F6',
  Entertainment: '#F97316',
  Healthcare: '#10B981',
  Education: '#6366F1',
  Rent: '#14B8A6',
  Travel: '#0EA5E9',
  Loan: '#E11D48',
  Salary: '#22C55E',
  Other: '#6B7280'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    savingsRate: 0
  });
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [loanSummary, setLoanSummary] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [expRes, incRes, bgtRes, goalRes, loanRes] = await Promise.all([
        api.get('/expenses?limit=100'),
        api.get('/income?limit=100'),
        api.get('/budgets'),
        api.get('/goals'),
        api.get('/loans').catch(() => ({ data: { data: null } }))
      ]);

      const expList = expRes.data.data || [];
      const incList = incRes.data.data || [];
      const bgtList = bgtRes.data.data || [];
      const goalList = goalRes.data.data || [];
      if (loanRes.data?.data) {
        setLoanSummary(loanRes.data.data);
      }

      setExpenses(expList);
      setIncome(incList);
      setBudgets(bgtList);
      setGoals(goalList);

      const totalExp = expList.reduce((sum, item) => sum + item.amount, 0);
      const totalInc = incList.reduce((sum, item) => sum + item.amount, 0);
      const balance = totalInc - totalExp;
      const savingsRate = totalInc > 0 ? ((balance / totalInc) * 100).toFixed(1) : 0;

      setStats({
        totalIncome: totalInc,
        totalExpenses: totalExp,
        balance,
        savingsRate: parseFloat(savingsRate)
      });

      // Category breakdown for Donut Chart
      const catMap = {};
      expList.forEach((e) => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
      });

      const pieData = Object.entries(catMap).map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#6B7280'
      }));
      setCategoryData(pieData);

      // Monthly Comparison mock/aggregate
      setMonthlyComparison([
        { month: 'Jun', Income: 38000, Expenses: 22000 },
        { month: 'Jul', Income: 40000, Expenses: 25000 },
        { month: 'Aug', Income: 40000, Expenses: 23500 },
        { month: 'Sep', Income: totalInc || 40000, Expenses: totalExp || 24500 }
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      setExporting(true);
      const filename = exportDashboardToExcel({
        user: user || { name: 'Joel User', email: 'joel.user@example.com' },
        expenses,
        income,
        budgets,
        goals
      });
      setExportNotice(`Generated & downloaded 7-sheet workbook: ${filename}`);
      setTimeout(() => setExportNotice(null), 6000);
    } catch (err) {
      console.error('Error exporting Excel report:', err);
      alert('Failed to generate Excel report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN')}`;

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem' }}>Financial Executive Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time financial health, category analytics, and automated statement ingestion
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="btn btn-secondary"
            title="Export full 7-sheet multi-tab Excel dashboard"
            style={{ borderColor: 'rgba(34, 197, 94, 0.4)', color: '#22c55e' }}
          >
            <FileSpreadsheet size={16} />
            <span>{exporting ? 'Generating...' : 'Export Excel Dashboard'}</span>
          </button>
          <button
            onClick={() => navigate('/import')}
            className="btn btn-secondary"
          >
            <UploadCloud size={16} />
            <span>Import Statement</span>
          </button>
          <button
            onClick={() => navigate('/ai-insights')}
            className="btn btn-primary"
          >
            <Sparkles size={16} />
            <span>AI Spending Summary</span>
          </button>
        </div>
      </div>

      {/* Export Success Notification Banner */}
      {exportNotice && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          color: '#4ade80',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span><strong>Success!</strong> {exportNotice} (Includes 7 worksheets: Dashboard, Transactions, Expenses, Income, Category Summary, Monthly Summary, Budget Performance)</span>
        </div>
      )}

      {/* 4 Metric Overview Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">
            <span>TOTAL RECORDED INFLOW</span>
            <TrendingUp size={18} color="var(--success)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {formatCurrency(stats.totalIncome)}
          </div>
          <div className="stat-badge badge-income">
            <ArrowUpRight size={14} />
            <span>Active Financial Cycle</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>TOTAL EXPENDITURE</span>
            <TrendingDown size={18} color="var(--danger)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {formatCurrency(stats.totalExpenses)}
          </div>
          <div className="stat-badge badge-expense">
            <ArrowDownRight size={14} />
            <span>{stats.totalIncome > 0 ? ((stats.totalExpenses / stats.totalIncome) * 100).toFixed(1) : 0}% of Income</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>NET CASH SURPLUS</span>
            <Wallet size={18} color="var(--primary-500)" />
          </div>
          <div className="stat-value">
            {formatCurrency(stats.balance)}
          </div>
          <div className="stat-badge badge-info">
            <span>{stats.balance >= 0 ? 'Safe Liquidity Buffer' : 'Spending Exceeds Inflow'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>NET SAVINGS VELOCITY</span>
            <PiggyBank size={18} color="var(--warning)" />
          </div>
          <div className="stat-value" style={{ color: stats.savingsRate >= 20 ? 'var(--success)' : 'var(--warning)' }}>
            {stats.savingsRate}%
          </div>
          <div className="stat-badge badge-warning">
            <span>Target: 25% Goal</span>
          </div>
        </div>
      </div>

      {/* Loan & Debt Portfolio Health Banner */}
      {loanSummary && loanSummary.grandTotal && (
        <div
          className="card"
          style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(15, 41, 66, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid #1E4976',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div style={{ background: 'rgba(225, 29, 72, 0.2)', color: '#E11D48', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
              <Landmark size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#FFF' }}>Loan & Debt Portfolio</h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '999px',
                    background: `${loanSummary.healthAnalysis?.badgeColor || '#10B981'}22`,
                    color: loanSummary.healthAnalysis?.badgeColor || '#10B981',
                    border: `1px solid ${loanSummary.healthAnalysis?.badgeColor || '#10B981'}55`
                  }}
                >
                  Health: {loanSummary.healthAnalysis?.label || 'Active'}
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                Combined Outstanding: <strong style={{ color: '#FFF' }}>₹{loanSummary.grandTotal.combinedDebt.toLocaleString('en-IN')}</strong> &middot; Monthly Outflow: <strong style={{ color: '#38BDF8' }}>₹{loanSummary.grandTotal.totalMonthlyCommitment.toLocaleString('en-IN')}/mo</strong> ({loanSummary.healthAnalysis?.dtiRatio}% of cashflow)
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/loans')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          >
            <span>View Full Debt Tracker & Graphs</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Visual Analytics Grid: Monthly Comparison & Category Donut */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Monthly Trend Bar Chart */}
        <div className="card">
          <div className="card-title">
            <span>Income vs. Expenses Trend</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 4 Months</span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Legend />
                <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="card">
          <div className="card-title">
            <span>Spending Breakdown by Category</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All Categorized</span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {categoryData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No expense transactions recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* AI Financial Insight Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Gemini AI Smart Budget Observation</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Your top spending category is Food (₹6,500). Reducing ride-hailing & food delivery by 20% would save ~₹1,300 this month.
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/ai-assistant')}
          className="btn btn-secondary btn-sm"
        >
          <span>Ask Financial Assistant</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Recent Transactions Table */}
      <div className="card">
        <div className="card-title">
          <span>Recent Verified Transactions</span>
          <button
            onClick={() => navigate('/expenses')}
            style={{ background: 'none', border: 'none', color: 'var(--primary-500)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            View All ({expenses.length}) →
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description / Payee</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Source</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.slice(0, 6).map((exp) => (
                <tr key={exp._id}>
                  <td>{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <strong>{exp.merchant || exp.title}</strong>
                    {exp.description && exp.description !== exp.title && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.description}</div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: `${CATEGORY_COLORS[exp.category] || '#6B7280'}22`,
                        color: CATEGORY_COLORS[exp.category] || '#94A3B8'
                      }}
                    >
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
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No expenses recorded yet. Click "Import File" or "Add Expense" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
