import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Clock,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  CreditCard,
  Building,
  HelpCircle,
  Edit2,
  Trash2,
  X,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import api from '../services/api';

const DONUT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#E11D48', '#14B8A6', '#F97316', '#6366F1'];

const Loans = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [paymentItem, setPaymentItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'loan',
    lender: '',
    principalAmount: '',
    monthlyEMI: '',
    remainingBalance: '',
    interestRate: '',
    status: 'active',
    notes: ''
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'UPI',
    notes: '',
    logAsExpense: true
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/loans');
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch loans:', err);
      setError('Could not load loan and debt records.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        principalAmount: Number(formData.principalAmount) || 0,
        monthlyEMI: Number(formData.monthlyEMI) || 0,
        remainingBalance: formData.remainingBalance ? Number(formData.remainingBalance) : Number(formData.principalAmount),
        interestRate: Number(formData.interestRate) || 0
      };

      if (editingItem) {
        await api.put(`/loans/${editingItem._id || editingItem.id}`, payload);
      } else {
        await api.post('/loans', payload);
      }

      setIsAddOpen(false);
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'loan',
        lender: '',
        principalAmount: '',
        monthlyEMI: '',
        remainingBalance: '',
        interestRate: '',
        status: 'active',
        notes: ''
      });
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save loan entry');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentItem) return;
    try {
      await api.post(`/loans/${paymentItem._id || paymentItem.id}/payment`, paymentData);
      setPaymentItem(null);
      setPaymentData({ amount: '', paymentMethod: 'UPI', notes: '', logAsExpense: true });
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}"?`)) return;
    try {
      await api.delete(`/loans/${id}`);
      fetchLoans();
    } catch (err) {
      alert('Failed to delete loan facility');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      lender: item.lender,
      principalAmount: item.principalAmount,
      monthlyEMI: item.monthlyEMI,
      remainingBalance: item.remainingBalance,
      interestRate: item.interestRate,
      status: item.status,
      notes: item.notes || ''
    });
    setIsAddOpen(true);
  };

  const openPaymentModal = (item) => {
    setPaymentItem(item);
    setPaymentData({
      amount: item.monthlyEMI || '',
      paymentMethod: 'UPI',
      notes: `Monthly EMI for ${item.name}`,
      logAsExpense: true
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
        <p>Loading loan and debt portfolio intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertTriangle size={36} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
        <h3>Failed to Load Loan Portfolio</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'An unexpected error occurred.'}</p>
        <button onClick={fetchLoans} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const { items, loansList, chittyList, loanSubtotal, chittySubtotal, grandTotal, healthAnalysis } = data;

  // Chart 1: Debt Distribution by Lender
  const lenderMap = {};
  items.forEach(i => {
    const l = i.lender || 'Other';
    lenderMap[l] = (lenderMap[l] || 0) + (i.remainingBalance || 0);
  });
  const lenderData = Object.entries(lenderMap).map(([name, value]) => ({ name, value }));

  // Chart 2: Monthly commitment by facility
  const monthlyCommitmentData = items
    .filter(i => (i.monthlyEMI || 0) > 0)
    .map(i => ({
      name: i.name.length > 15 ? i.name.slice(0, 14) + '...' : i.name,
      fullName: i.name,
      emi: i.monthlyEMI
    }))
    .sort((a, b) => b.emi - a.emi)
    .slice(0, 7);

  // Chart 3: Principal vs Remaining Outstanding
  const payoffData = items.slice(0, 7).map(i => ({
    name: i.name.length > 14 ? i.name.slice(0, 13) + '...' : i.name,
    principal: i.principalAmount,
    remaining: i.remainingBalance
  }));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#E11D48', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <Landmark size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Loans & Debt Management</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Comprehensive tracking of loans, gold loans, chitties, and liabilities with real-time health scoring.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                name: '',
                category: 'loan',
                lender: '',
                principalAmount: '',
                monthlyEMI: '',
                remainingBalance: '',
                interestRate: '',
                status: 'active',
                notes: ''
              });
              setIsAddOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Loan / Chitty</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {/* Total Combined Debt */}
        <div className="card stat-card" style={{ borderLeft: '4px solid #E11D48' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">COMBINED TOTAL DEBT</div>
              <div className="stat-value" style={{ color: '#E11D48' }}>
                ₹{grandTotal.combinedDebt.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                Across {grandTotal.totalFacilities} active facilities
              </div>
            </div>
            <div style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#E11D48', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
              <Landmark size={22} />
            </div>
          </div>
        </div>

        {/* Monthly Commitment */}
        <div className="card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">MONTHLY COMMITMENT</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                ₹{grandTotal.totalMonthlyCommitment.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                Loans: ₹{loanSubtotal.monthlyEMI.toLocaleString('en-IN')} | Chitties: ₹{chittySubtotal.monthlyInstallment.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
              <Calendar size={22} />
            </div>
          </div>
        </div>

        {/* Loan Health Status */}
        <div className="card stat-card" style={{ borderLeft: `4px solid ${healthAnalysis.badgeColor}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">DEBT HEALTH VERDICT</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: healthAnalysis.badgeColor
                  }}
                />
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: healthAnalysis.badgeColor }}>
                  {healthAnalysis.label}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                Debt-to-Income: <strong>{healthAnalysis.dtiRatio}%</strong> &middot; Score: {healthAnalysis.score}/100
              </div>
            </div>
            <div style={{ background: `${healthAnalysis.badgeColor}22`, color: healthAnalysis.badgeColor, padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
              {healthAnalysis.status === 'good' ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
            </div>
          </div>
        </div>

        {/* Outstanding Subtotals */}
        <div className="card stat-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">DEBT SPLIT</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.3rem' }}>
                Loans: ₹{loanSubtotal.remainingBalance.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Chitties/Payables: ₹{chittySubtotal.remainingBalance.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
              <PieIcon size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Health Diagnosis Banner ("Are loans doing good or bad?") */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          background: `linear-gradient(135deg, rgba(23, 59, 97, 0.4), rgba(15, 23, 42, 0.8))`,
          border: `1px solid ${healthAnalysis.badgeColor}44`,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1.25rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ background: `${healthAnalysis.badgeColor}25`, color: healthAnalysis.badgeColor, padding: '0.75rem', borderRadius: '50%' }}>
          <Zap size={24} />
        </div>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#FFF' }}>
              Loan Performance & Debt Health Analysis: <span style={{ color: healthAnalysis.badgeColor }}>{healthAnalysis.label}</span>
            </h4>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.6rem',
                borderRadius: '999px',
                background: `${healthAnalysis.badgeColor}22`,
                color: healthAnalysis.badgeColor,
                border: `1px solid ${healthAnalysis.badgeColor}55`
              }}
            >
              Health Score {healthAnalysis.score} / 100
            </span>
          </div>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {healthAnalysis.diagnosis}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#38BDF8' }}>
            <ArrowUpRight size={16} />
            <span><strong>Recommendation:</strong> {healthAnalysis.recommendation}</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Chart 1: Debt Distribution by Lender */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={18} color="#E11D48" />
            <span>Debt Exposure by Lender / Provider</span>
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={lenderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {lenderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{ background: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Monthly Commitments */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--primary)" />
            <span>Top Monthly Outflow Commitments (EMI / Chitty)</span>
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyCommitmentData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} interval={0} angle={-20} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val, name, props) => [`₹${Number(val).toLocaleString('en-IN')}`, props.payload.fullName]}
                  contentStyle={{ background: '#1E293B', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="emi" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABLE 1: Loans Subtotal Section (matching user image) */}
      <div className="card" style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF' }}>Bank & Co-operative Loans / Personal Debts</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Total {loansList.length} loan accounts
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Outstanding: <strong style={{ color: '#E11D48' }}>₹{loanSubtotal.remainingBalance.toLocaleString('en-IN')}</strong>
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Account / Loan Name</th>
                <th>Type / Lender</th>
                <th style={{ textAlign: 'right' }}>Total / Principal</th>
                <th style={{ textAlign: 'right' }}>Monthly EMI</th>
                <th style={{ textAlign: 'right' }}>Paid This Month</th>
                <th style={{ textAlign: 'right' }}>Remaining Balance</th>
                <th style={{ textAlign: 'center' }}>Interest</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loansList.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.notes}</div>}
                  </td>
                  <td>
                    <span style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {item.lender}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>
                    ₹{item.principalAmount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: item.monthlyEMI > 0 ? '#38BDF8' : 'var(--text-muted)' }}>
                    ₹{item.monthlyEMI.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10B981' }}>
                    ₹{(item.paidThisMonth || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#FFF' }}>
                    ₹{item.remainingBalance.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                    {item.interestRate > 0 ? `${item.interestRate.toFixed(2)}%` : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: item.status === 'active' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: item.status === 'active' ? '#60A5FA' : '#34D399'
                      }}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => openPaymentModal(item)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Record Payment"
                      >
                        Pay EMI
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.4rem' }}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id || item.id, item.name)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.4rem', color: 'var(--danger)' }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* LOAN SUBTOTAL ROW (matching user spreadsheet) */}
              <tr style={{ background: 'rgba(30, 41, 59, 0.9)', fontWeight: 700, borderTop: '2px solid #334155' }}>
                <td>LOAN SUBTOTAL</td>
                <td>{loanSubtotal.count} Facilities</td>
                <td style={{ textAlign: 'right' }}>₹{loanSubtotal.principal.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', color: '#38BDF8' }}>₹{loanSubtotal.monthlyEMI.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', color: '#10B981' }}>₹{loanSubtotal.paidThisMonth.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', color: '#FFF' }}>₹{loanSubtotal.remainingBalance.toLocaleString('en-IN')}</td>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: Chitties, Investments & Payables (matching user image) */}
      <div className="card" style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF' }}>Chitties, Investments & Balance Payables</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Total {chittyList.length} chitty and payable contracts
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Liability: <strong style={{ color: '#8B5CF6' }}>₹{chittySubtotal.remainingBalance.toLocaleString('en-IN')}</strong>
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Scheme / Chitty / Payable Name</th>
                <th>Provider</th>
                <th style={{ textAlign: 'right' }}>Total / Prize Value</th>
                <th style={{ textAlign: 'right' }}>Monthly Installment</th>
                <th style={{ textAlign: 'right' }}>Paid This Month</th>
                <th style={{ textAlign: 'right' }}>Remaining Liability</th>
                <th style={{ textAlign: 'center' }}>Interest</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chittyList.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.notes}</div>}
                  </td>
                  <td>
                    <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {item.lender}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>
                    ₹{item.principalAmount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#38BDF8' }}>
                    ₹{item.monthlyEMI.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: item.paidThisMonth > 0 ? '#10B981' : 'var(--text-muted)' }}>
                    {item.paidThisMonth > 0 ? `₹${item.paidThisMonth.toLocaleString('en-IN')}` : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#FFF' }}>
                    ₹{item.remainingBalance.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {item.interestRate > 0 ? `${item.interestRate.toFixed(2)}%` : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#60A5FA'
                      }}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => openPaymentModal(item)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Record Installment"
                      >
                        Pay Due
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.4rem' }}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id || item.id, item.name)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.4rem', color: 'var(--danger)' }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* CHITTY SUB-TOTAL ROW (matching user spreadsheet) */}
              <tr style={{ background: 'rgba(30, 41, 59, 0.9)', fontWeight: 700, borderTop: '2px solid #334155' }}>
                <td>CHITTY + INVESTMENT + PAYABLE SUBTOTAL</td>
                <td>{chittySubtotal.count} Schemes</td>
                <td style={{ textAlign: 'right' }}>₹{chittySubtotal.principal.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', color: '#38BDF8' }}>₹{chittySubtotal.monthlyInstallment.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', color: '#10B981' }}>₹{chittySubtotal.paidThisMonth.toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', color: '#FFF' }}>₹{chittySubtotal.remainingBalance.toLocaleString('en-IN')}</td>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* GRAND TOTAL COMBINED DEBT BAR (matching high-contrast dark blue bar in user image) */}
      <div
        style={{
          background: '#0F2942',
          border: '1px solid #1E4976',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          marginBottom: '3rem'
        }}
      >
        <div>
          <div style={{ color: '#93C5FD', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            GRAND TOTAL — COMBINED DEBT
          </div>
          <div style={{ color: '#E2E8F0', fontSize: '1.05rem', fontWeight: 600 }}>
            (Loans + Chitty + Investment + Payable)
          </div>
          <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Monthly Outflow Requirement: <strong style={{ color: '#38BDF8' }}>₹{grandTotal.totalMonthlyCommitment.toLocaleString('en-IN')} / month</strong>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#FFF', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ₹{grandTotal.combinedDebt.toLocaleString('en-IN')}
          </div>
          <div style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600 }}>
            {grandTotal.totalFacilities} Combined Liabilities Tracked
          </div>
        </div>
      </div>

      {/* MODAL: Add / Edit Facility */}
      {isAddOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-500)', padding: '0.45rem', borderRadius: '10px' }}>
                  <Landmark size={20} />
                </div>
                <h3 style={{ margin: 0 }}>{editingItem ? 'Edit Liability / Facility' : 'Add New Loan, Chitty or Debt'}</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate}>
              <div className="modal-body">
                {/* Category Selector Pills */}
                <div className="input-group">
                  <label className="input-label">Category Classification *</label>
                  <div className="pill-selector-group">
                    {[
                      { id: 'loan', label: '🏛️ Bank / Co-op Loan' },
                      { id: 'chitty', label: '🤝 Chitty Scheme (KSFE)' },
                      { id: 'investment', label: '🛡️ Insurance / Investment' },
                      { id: 'payable', label: '📝 Personal Debt / Payable' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`pill-option ${formData.category === cat.id ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Facility Name & Provider */}
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Facility / Account Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Canara Gold Loan, KSFE Chitty 4"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Lender / Provider *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Co-op, KSFE, Canara, LIC"
                      value={formData.lender}
                      onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                      className="input-field"
                    />
                    <div className="preset-chip-list">
                      {['Co-op Bank', 'KSFE', 'Canara', 'LIC', 'Jeevakarunya', 'Muthoot', 'Personal'].map(preset => (
                        <span
                          key={preset}
                          className="preset-chip"
                          onClick={() => setFormData({ ...formData, lender: preset })}
                        >
                          + {preset}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Principal & Monthly EMI */}
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Principal / Total Amount *</label>
                    <div className="input-currency-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="50000"
                        value={formData.principalAmount}
                        onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Monthly EMI / Installment</label>
                    <div className="input-currency-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="2500"
                        value={formData.monthlyEMI}
                        onChange={(e) => setFormData({ ...formData, monthlyEMI: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>

                {/* Remaining Balance & Interest Rate */}
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Current Outstanding Balance</label>
                    <div className="input-currency-wrapper">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Leave blank if same as Principal"
                        value={formData.remainingBalance}
                        onChange={(e) => setFormData({ ...formData, remainingBalance: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 8.5"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      className="input-field"
                    />
                    <div className="preset-chip-list">
                      {[0, 7.5, 8.5, 9.5, 11, 12.5].map(rate => (
                        <span
                          key={rate}
                          className="preset-chip"
                          onClick={() => setFormData({ ...formData, interestRate: rate })}
                        >
                          {rate === 0 ? '0% Free' : `${rate}%`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Pills */}
                <div className="input-group">
                  <label className="input-label">Status Classification</label>
                  <div className="pill-selector-group">
                    {[
                      { id: 'active', label: '🟢 Active & Ongoing' },
                      { id: 'closed', label: '✅ Fully Paid / Closed' },
                      { id: 'overdue', label: '⚠️ Overdue / Attention Required' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        className={`pill-option ${formData.status === st.id ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, status: st.id })}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="input-group">
                  <label className="input-label">Additional Remarks / Account Details</label>
                  <textarea
                    rows={2}
                    placeholder="Account number, auction schedule, gold weight, nominee..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Updates' : 'Save Facility to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record EMI / Installment Payment */}
      {paymentItem && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '0.45rem', borderRadius: '10px' }}>
                  <CheckCircle2 size={20} />
                </div>
                <h3 style={{ margin: 0 }}>Record Payment for {paymentItem.name}</h3>
              </div>
              <button onClick={() => setPaymentItem(null)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lender / Facility</div>
                    <strong style={{ fontSize: '0.95rem' }}>{paymentItem.lender} &middot; {paymentItem.name}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Remaining Balance</div>
                    <strong style={{ color: '#E11D48', fontSize: '1.05rem' }}>₹{(paymentItem.remainingBalance || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Payment Outflow Amount (₹) *</label>
                  <div className="input-currency-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Enter amount paid"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Payment Channel</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="input-field"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm / BHIM)</option>
                    <option value="Net Banking">Net Banking / NEFT / RTGS / IMPS</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash at Branch / Collector</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Transaction Reference / Narration</label>
                  <input
                    type="text"
                    placeholder="e.g. September EMI, UTR ref #891238..."
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(99, 102, 241, 0.08)',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}
                >
                  <input
                    type="checkbox"
                    id="logExpense"
                    checked={paymentData.logAsExpense}
                    onChange={(e) => setPaymentData({ ...paymentData, logAsExpense: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-500)' }}
                  />
                  <label htmlFor="logExpense" style={{ fontSize: '0.85rem', color: '#F8FAFC', cursor: 'pointer', lineHeight: '1.4' }}>
                    Automatically log this payment as an <strong>Expense</strong> under category <strong>Loan</strong> for full accounting
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setPaymentItem(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Payment Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
