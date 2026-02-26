import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLoading } from '../context/LoadingContext';
import './AgentDashboard.css';
import { authAPI, orderAPI, userAPI, commissionAPI } from '../utils/apiClient';

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [agentData, setAgentData] = useState({
    name: '',
    tier: 'Bronze',
    totalEarnings: 0,
    monthlyEarnings: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    commissionRate: '0%',
    activeReferrals: 0,
    pendingCommission: 0,
    points: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const { startLoading, finishLoading } = useLoading();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [myCommissions, setMyCommissions] = useState({ commissions: [] });

  useEffect(() => {
    const loadData = async () => {
      startLoading();
      setLoading(true);
      try {
        const [meRes, myOrdersRes, commissionsRes] = await Promise.all([
          authAPI.getMe(),
          orderAPI.getAssigned({ page, limit }),
          commissionAPI.getMy()
        ]);

        // Redirect if not an agent
        if (!meRes || meRes.role !== 'AGENT') {
          if (meRes && meRes.role === 'ADMIN') {
            window.location.href = '/admin';
            return;
          }
          window.location.href = '/auth/signin';
          return;
        }

        const myOrders = myOrdersRes?.assignedOrders || [];
        const count = myOrdersRes?.count || myOrders.length;
        const commissionsList = commissionsRes?.commissions || [];

        setRecentOrders(myOrders);
        setTotalOrders(count);
        setMyCommissions(commissionsRes);

        // Calculate earnings
        const totalEarnings = commissionsList.reduce((s, c) => s + (c.amount || c.amountEarned || 0), 0);
        const monthlyEarnings = commissionsList.filter(c => new Date(c.createdAt) >= new Date(new Date().setDate(new Date().getDate() - 30))).reduce((s, c) => s + (c.amount || c.amountEarned || 0), 0);

        setAgentData(prev => ({
          ...prev,
          id: meRes._id,
          name: `${meRes.firstName || ''} ${meRes.lastName || ''}`.trim() || meRes.email,
          email: meRes.email,
          phone: meRes.phone || prev.phone,
          referralCode: meRes.agentProfile?.referralCode || null,
          tier: meRes.agentProfile?.tier || prev.tier,
          totalEarnings,
          monthlyEarnings,
          totalOrders: count,
          monthlyOrders: myOrders.filter(o => new Date(o.createdAt) >= new Date(new Date().setDate(new Date().getDate() - 30))).length,
          commissionRate: `${(meRes.agentProfile?.commissionRate || 0) * 100}%`,
          activeReferrals: meRes.agentProfile?.activeReferrals || 0,
          pendingCommission: commissionsList.filter(c => c.status === 'PENDING').reduce((s, c) => s + (c.amount || c.amountEarned || 0), 0),
          points: meRes.agentProfile?.points || 0
        }));
      } catch (err) {
        console.error('Failed loading agent dashboard data', err);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
        finishLoading();
      }
    };

    loadData();

    const interval = setInterval(loadData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [page, limit]);


  // Chart data computed from orders (last 6 months)
  const chartData = (() => {
    const res = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = dt.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(dt.getFullYear(), dt.getMonth(), 1);
      const monthEnd = new Date(dt.getFullYear(), dt.getMonth() + 1, 1);
      const sum = (recentOrders || []).reduce((s, o) => {
        const d = new Date(o.createdAt);
        return s + ((d >= monthStart && d < monthEnd) ? (o.total || 0) : 0);
      }, 0);
      res.push({ month: monthLabel, earnings: sum });
    }
    return res;
  })();

  const thisMonthEarnings = chartData[chartData.length - 1]?.earnings ?? 0;
  const totalRevenue = (recentOrders || []).reduce((s, o) => s + (o.total || 0), 0);
  const totalOrdersCount = (recentOrders || []).length;
  const paidOrders = (recentOrders || []).filter(o => (o.paymentStatus === 'PAID' || o.status === 'DELIVERED' || o.status === 'COMPLETED')).length;
  const conversionRate = totalOrdersCount ? ((paidOrders / totalOrdersCount) * 100).toFixed(1) + '%' : '0%';
  const avgOrderValue = totalOrdersCount ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const performanceMetrics = [
    { label: 'This Month', value: `₹ ${thisMonthEarnings}`, change: '', positive: true },
    { label: 'Conversion Rate', value: `${conversionRate}`, change: '', positive: true },
    { label: 'Avg Order Value', value: `₹ ${avgOrderValue}`, change: '', positive: avgOrderValue > 0 }
  ];

  if (loading && !agentData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">Syncing Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-dashboard">
      <div className="container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Agent Dashboard</h1>
            <p className="agent-greeting">Welcome back, {agentData.name}!</p>
          </div>
          <div className="tier-badge">
            <span className="tier-label">{agentData.tier} Tier</span>
            <div className="tier-progress" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Earnings</span>
              <span className="stat-icon">💰</span>
            </div>
            <div className="stat-value">{agentData.totalEarnings}</div>
            <div className="stat-subtitle">Lifetime</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Points</span>
              <span className="stat-icon">⭐</span>
            </div>
            <div className="stat-value">{agentData.points}</div>
            <div className="stat-subtitle">Reward Points</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Monthly Earnings</span>
              <span className="stat-icon">📊</span>
            </div>
            <div className="stat-value">{agentData.monthlyEarnings}</div>
            <div className="stat-subtitle">This Month</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Orders</span>
              <span className="stat-icon">📦</span>
            </div>
            <div className="stat-value">{agentData.totalOrders}</div>
            <div className="stat-subtitle">{agentData.monthlyOrders} this month</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Commission Rate</span>
              <span className="stat-icon">⭐</span>
            </div>
            <div className="stat-value">{agentData.commissionRate}</div>
            <div className="stat-subtitle">Gold Tier Benefits</div>
          </div>
        </div>

        {/* Tabs for navigation */}
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`tab-button ${activeTab === 'referrals' ? 'active' : ''}`}
            onClick={() => setActiveTab('referrals')}
          >
            Referrals
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              <div className="content-row">
                <div className="chart-section">
                  <h3>Monthly Earnings Trend</h3>
                  <div className="simple-chart">
                    <div className="chart-bars">
                      {(() => {
                        const max = Math.max(...chartData.map(c => c.earnings), 1);
                        return chartData.map((item, idx) => (
                          <div key={idx} className="bar-container">
                            <div
                              className="bar"
                              style={{ height: `${(item.earnings / max) * 100}%` }}
                              title={`₹${item.earnings}`}
                            ></div>
                            <span className="bar-label">{item.month}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                <div className="metrics-section">
                  <h3>Performance Metrics</h3>
                  <div className="metrics-list">
                    {performanceMetrics.map((metric, idx) => (
                      <div key={idx} className="metric-row">
                        <div>
                          <div className="metric-label">{metric.label}</div>
                          <div className="metric-value">{metric.value}</div>
                        </div>
                        <div className={`metric-change ${metric.positive ? 'positive' : 'negative'}`}>
                          {metric.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="info-cards">
                <div className="info-card">
                  <h4>Pending Commission</h4>
                  <p className="pending-amount">{agentData.pendingCommission}</p>
                  <button className="withdraw-btn">Request Withdrawal</button>
                </div>

                <div className="info-card">
                  <h4>Active Referrals</h4>
                  <p className="referrals-count">{agentData.activeReferrals}</p>
                  <button className="manage-btn">Manage Referrals</button>
                </div>

                <div className="info-card">
                  <h4>Next Tier Goal</h4>
                  <p className="tier-goal">₹ 5,000 more needed for Platinum</p>
                  <button className="progress-btn">View Progress</button>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-content">
              <div className="orders-title">
                <h2>Recent Orders</h2>
              </div>
              <div className="orders-table">
                <div className="table-header">
                  <div className="col-id">Order ID</div>
                  <div className="col-product">Product(s)</div>
                  <div className="col-total">Total</div>
                  <div className="col-date">Date</div>
                  <div className="col-status">Status</div>
                </div>
                {(recentOrders || []).map((order) => {
                  const products = (order.items || []).map(i => i.name).join(', ');
                  return (
                    <div key={order._id || order.orderNumber} className="table-row">
                      <div className="col-id">{order.orderNumber || (order._id)}</div>
                      <div className="col-product">{products}</div>
                      <div className="col-total">₹{order.total || 0}</div>
                      <div className="col-date">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="col-status">
                        <span className={`status-badge status-${(order.status || '').toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="referrals-content">
              <div className="referral-header">
                <h3>Your Referral</h3>
              </div>

              {agentData.referralCode ? (
                <div className="referral-cards">
                  <div className="referral-card">
                    <div className="link-code">
                      <span className="code-label">Referral Code</span>
                      <div className="code-display">
                        <input
                          type="text"
                          value={agentData.referralCode}
                          readOnly
                          className="code-input"
                        />
                        <button className="copy-btn" onClick={() => {
                          navigator.clipboard.writeText(agentData.referralCode);
                          toast.success('Copied to clipboard!');
                        }}>
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="link-stats">
                      <div className="stat">
                        <span className="stat-name">Total Commissions</span>
                        <span className="stat-num">₹{agentData.totalEarnings}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-name">Pending</span>
                        <span className="stat-num">₹{agentData.pendingCommission}</span>
                      </div>
                    </div>

                    <button className="details-btn">View Details</button>
                  </div>
                </div>
              ) : (
                <p>No referral code assigned yet.</p>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users-content">
              <h3>All Users</h3>
              <div className="users-table">
                <div className="table-header">
                  <div className="col-name">Name</div>
                  <div className="col-email">Email</div>
                  <div className="col-role">Role</div>
                  <div className="col-status">Status</div>
                </div>
                <div className="table-row"><div style={{ padding: '12px' }}>User data not implemented for this tab.</div></div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-content">
              <div className="settings-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue={agentData.name} readOnly />
                </div>

                <div className="form-group">
                  <label>Agent ID</label>
                  <input type="text" defaultValue={agentData.id || '—'} readOnly />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" defaultValue={agentData.email || ''} />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" defaultValue={agentData.phone || ''} />
                </div>

                <div className="form-group">
                  <label>Bank Account</label>
                  <input type="text" placeholder="Enter your bank account number" />
                </div>

                <div className="form-group">
                  <label>IFSC Code</label>
                  <input type="text" placeholder="Enter IFSC code" />
                </div>

                <div className="form-actions">
                  <button className="save-btn">Save Changes</button>
                  <button className="reset-btn">Reset Password</button>
                </div>
              </div>

              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <button className="deactivate-btn">Deactivate Account</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
