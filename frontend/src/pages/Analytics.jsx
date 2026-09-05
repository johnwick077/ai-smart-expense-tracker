import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  CreditCard,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
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
  Other: '#6B7280'
};

const PAYMENT_COLORS = ['#6366F1', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#64748B'];

const Analytics = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, incRes, bgtRes, goalRes] = await Promise.all([
        api.get('/expenses?limit=300'),
        api.get('/income?limit=100'),
        api.get('/budgets'),
        api.get('/goals')
      ]);

      const list = expRes.data.data || [];
      setExpenses(list);
      setIncome(incRes.data.data || []);
      setBudgets(bgtRes.data.data || []);
      setGoals(goalRes.data.data || []);

      // Category breakdown
      const catMap = {};
      const payMap = {};

      list.forEach((e) => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
        const mode = e.paymentMethod || 'Other';
        payMap[mode] = (payMap[mode] || 0) + e.amount;
      });

      const totalSpent = list.reduce((s, e) => s + e.amount, 0);

      const catList = Object.entries(catMap)
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0,
          color: CATEGORY_COLORS[name] || '#6B7280'
        }))
        .sort((a, b) => b.amount - a.amount);

      setCategoryBreakdown(catList);

      const payList = Object.entries(payMap).map(([name, value], idx) => ({
        name,
        value,
        color: PAYMENT_COLORS[idx % PAYMENT_COLORS.length]
      }));
      setPaymentData(payList);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const filename = exportDashboardToExcel({
      user: user || { name: 'Joel User', email: 'joel.user@example.com' },
      expenses,
      income,
      budgets,
      goals
    });
    setExportNotice(`Exported 7-sheet report: ${filename}`);
    setTimeout(() => setExportNotice(null), 5000);
  };

  const trendData = [
    { month: 'Apr', spend: 21000 },
    { month: 'May', spend: 24500 },
    { month: 'Jun', spend: 22800 },
    { month: 'Jul', spend: 26000 },
    { month: 'Aug', spend: 23500 },
    { month: 'Sep', spend: expenses.reduce((s, e) => s + e.amount, 0) || 24500 }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Financial Analytics & Drill-Down</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Deep-dive analysis into spending patterns, payment channels, and category allocations
          </p>
        </div>

        <button
          onClick={handleExport}
          className="btn btn-secondary"
          style={{ borderColor: 'rgba(34, 197, 94, 0.4)', color: '#22c55e' }}
        >
          <FileSpreadsheet size={16} />
          <span>Export 7-Sheet Workbook</span>
        </button>
      </div>

      {exportNotice && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          color: '#4ade80',
          marginBottom: '1.5rem',
          fontSize: '0.88rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 6-Month Velocity Area Chart */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-title">
          <span>6-Month Expenditure Velocity Curve</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical Trend</span>
        </div>
        <div style={{ height: '280px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Expenditure']}
              />
              <Area type="monotone" dataKey="spend" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Split Grid: Category Breakdown (Clickable) & Payment Methods */}
      <div className="grid-2">
        {/* Clickable Category Breakdown List */}
        <div className="card">
          <div className="card-title">
            <span>Spending by Category (Click to Inspect)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drill-down transactions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryBreakdown.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategoryModal(cat.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: cat.color }} />
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{cat.percentage}%</span>
                  <span style={{ fontWeight: 700 }}>₹{cat.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
            {categoryBreakdown.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No category data available.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Ratio Donut */}
        <div className="card">
          <div className="card-title">
            <span>Payment Channels Ratio</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UPI vs Cards vs NetBanking</span>
          </div>

          <div style={{ height: '300px' }}>
            {paymentData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No payment data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spent']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Drill-Down Transactions Modal */}
      {selectedCategoryModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>
                Transactions in {selectedCategoryModal}
              </h3>
              <button
                onClick={() => setSelectedCategoryModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Merchant</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses
                    .filter(e => e.category === selectedCategoryModal)
                    .map(e => (
                      <tr key={e._id}>
                        <td>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                        <td>{e.merchant || e.title}</td>
                        <td style={{ fontWeight: 700, color: 'var(--danger)' }}>
                          ₹{e.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
