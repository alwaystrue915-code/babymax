'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsIcon, UsersIcon, ShieldIcon, InstagramIcon, SendIcon } from '@/components/Icons'; 
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'settings'
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [instagramLink, setInstagramLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [appName, setAppName] = useState('');
  const [appDownloadLink, setAppDownloadLink] = useState('');
  const [appLogoUrl, setAppLogoUrl] = useState('');
  const [appVersion, setAppVersion] = useState('');
  const [appSize, setAppSize] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');
  const [upiAmount, setUpiAmount] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [showNotice, setShowNotice] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState('');
  
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveUserId, setApproveUserId] = useState(null);
  const [activationKeyInput, setActivationKeyInput] = useState('');

  const rejectionReasons = [
    "Fake Payment Screenshot",
    "Payment Not Received in Bank",
    "Invalid UTR / Reference Number",
    "Amount Mismatch (₹499 Required)",
    "Transaction Expired / Old UTR"
  ];

  useEffect(() => {
    // Check if user is admin
    const storedAdmin = localStorage.getItem('adminUser');
    if (!storedAdmin) {
      window.location.href = '/admin/login';
      return;
    }
    try {
      const admin = JSON.parse(storedAdmin);
      if (admin.role !== 'admin') {
        window.location.href = '/admin/login';
        return;
      }
    } catch (e) {
      window.location.href = '/admin/login';
      return;
    }

    fetchUsers();
    fetchSettings();
    fetchRequests();
    if (activeTab === 'users') fetchUsers();
  }, [router, activeTab]);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/payment/requests', {
        headers: { 
          'x-api-key': 'sailent_secure_v1_key',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
        return;
      }
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error('Failed to load payment requests.');
    }
    setLoadingRequests(false);
  };

  const handleRejectClick = (userId) => {
    setRejectUserId(userId);
    setShowRejectModal(true);
  };

  const handleRequestAction = async (userId, status, reason = '', activationKey = '') => {
    if (status === 'rejected' && !reason) {
      handleRejectClick(userId);
      return;
    }

    if (status === 'approved' && !activationKey) {
      setApproveUserId(userId);
      setShowApproveModal(true);
      return;
    }
    
    setProcessingId(userId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/payment/requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'sailent_secure_v1_key',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, status, rejectionReason: reason, activationKey })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Request ${status} successfully!`);
        fetchRequests();
        if (status === 'approved') {
          setShowApproveModal(false);
          setActivationKeyInput('');
        }
      } else {
        toast.error(data.message || `Failed to ${status} request.`);
      }
    } catch (error) {
      console.error('Failed to update request', error);
      toast.error('An error occurred while updating the request.');
    }
    setProcessingId(null);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/users', {
        headers: { 
          'x-api-key': 'sailent_secure_v1_key',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
        return;
      }
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to load users.');
    }
    setLoadingUsers(false);
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        headers: { 
          'x-api-key': 'sailent_secure_v1_key',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setInstagramLink(data.settings.instagramLink || '');
        setTelegramLink(data.settings.telegramLink || '');
        setAppName(data.settings.appName || '');
        setAppDownloadLink(data.settings.appDownloadLink || '');
        setAppLogoUrl(data.settings.appLogoUrl || '');
        setAppVersion(data.settings.appVersion || '');
        setAppSize(data.settings.appSize || '');
        setUpiId(data.settings.upiId || '');
        setUpiName(data.settings.upiName || '');
        setUpiAmount(data.settings.upiAmount || '');
        setNoticeText(data.settings.noticeText || '');
        setShowNotice(data.settings.showNotice !== undefined ? data.settings.showNotice : true);
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
      toast.error('Failed to load settings.');
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'sailent_secure_v1_key',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          instagramLink, 
          telegramLink,
          appName,
          appDownloadLink,
          appLogoUrl,
          appVersion,
          appSize,
          upiId,
          upiName,
          upiAmount: upiAmount ? Number(upiAmount) : 499,
          noticeText,
          showNotice
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings.');
      }
    } catch (error) {
      toast.error('An error occurred.');
    }
    setSavingSettings(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  return (
    <div className="admin-container">
      <div className="admin-mobile-wrapper">
        
        {/* Header */}
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="admin-badge"><ShieldIcon size={20} /></div>
            <h2>Admin Panel</h2>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        {/* Content - Adjusted padding for bottom nav */}
        <div className="admin-content" style={{ paddingBottom: '100px' }}>
          
          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="tab-pane animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Payment Requests</h3>
                <button onClick={fetchRequests} className="refresh-btn">
                   Refresh
                </button>
              </div>
              
              {loadingRequests ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading requests...</div>
              ) : (
                <div className="request-list">
                  {requests.filter(r => r.paymentStatus === 'pending' || !r.paymentStatus).map((req) => (
                    <div key={req._id} className="request-card">
                      <div className="request-header">
                        <span className="status-badge pending">PENDING</span>
                        <span className="request-time">{new Date(req.updatedAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="request-body">
                        <div className="req-item"><strong>User:</strong> {req.fullName}</div>
                        <div className="req-item"><strong>Email:</strong> {req.email}</div>
                        <div className="req-item utr-box"><strong>UTR:</strong> <code>{req.utr || 'N/A'}</code></div>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="action-btn approve"
                          onClick={() => handleRequestAction(req._id, 'approved')}
                          disabled={processingId === req._id}
                        >
                          Approve
                        </button>
                        <button 
                          className="action-btn reject"
                          onClick={() => handleRejectClick(req._id)}
                          disabled={processingId === req._id}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {requests.filter(r => r.paymentStatus === 'pending' || !r.paymentStatus).length === 0 && (
                    <div className="empty-state">No pending requests</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="tab-pane animate-fade-in">
              <h3>Total Users: {users.length}</h3>
              {loadingUsers ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading users...</div>
              ) : (
                <div className="user-list">
                  {users.map((user) => (
                    <div key={user._id} className="user-card">
                      <div className="user-avatar">{user.fullName.charAt(0).toUpperCase()}</div>
                      <div className="user-info">
                        <h4>{user.fullName}</h4>
                        <p>{user.email}</p>
                      </div>
                      <div className="user-date">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <p style={{textAlign: 'center', color: '#666'}}>No users found.</p>}
                </div>
              )}
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="tab-pane animate-fade-in">
              <h3>App Settings</h3>
              <form onSubmit={saveSettings} className="settings-form">
                <div className="input-group">
                  <label className="input-label">App Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Logo Image URL</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="/logo.png or https://..."
                    value={appLogoUrl}
                    onChange={(e) => setAppLogoUrl(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Download Link</label>
                  <input 
                    type="url" 
                    className="input-field" 
                    value={appDownloadLink}
                    onChange={(e) => setAppDownloadLink(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">App Version</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="v1.0.0"
                      value={appVersion}
                      onChange={(e) => setAppVersion(e.target.value)}
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">App Size</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="12 MB"
                      value={appSize}
                      onChange={(e) => setAppSize(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Save App Config'}
                </button>
              </form>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="tab-pane animate-fade-in">
              <h3>Payment Settings</h3>
              <form onSubmit={saveSettings} className="settings-form">
                <div className="input-group">
                  <label className="input-label">UPI ID</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Merchant Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Amount (₹)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Save Payment Config'}
                </button>
              </form>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="tab-pane animate-fade-in">
              <h3>Social Links</h3>
              <form onSubmit={saveSettings} className="settings-form">
                <div className="input-group">
                  <label className="input-label">Instagram Link</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><InstagramIcon size={18} /></span>
                    <input 
                      type="url" 
                      className="input-field with-icon" 
                      value={instagramLink}
                      onChange={(e) => setInstagramLink(e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Telegram Link</label>
                  <div className="input-wrapper">
                    <span className="input-icon"><SendIcon size={18} /></span>
                    <input 
                      type="url" 
                      className="input-field with-icon" 
                      value={telegramLink}
                      onChange={(e) => setTelegramLink(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Save Social Config'}
                </button>
              </form>
            </div>
          )}

          {/* Notice Tab */}
          {activeTab === 'notice' && (
            <div className="tab-pane animate-fade-in">
              <h3>Notice Banner</h3>
              <form onSubmit={saveSettings} className="settings-form">
                <div className="input-group">
                  <label className="input-label">Notice Message</label>
                  <textarea 
                    className="input-field" 
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={noticeText}
                    onChange={(e) => setNoticeText(e.target.value)}
                    placeholder="Enter notice text here..."
                  />
                </div>
                <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="showNotice"
                    checked={showNotice}
                    onChange={(e) => setShowNotice(e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <label htmlFor="showNotice" className="input-label" style={{ margin: 0 }}>Show Notice Banner</label>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Update Notice'}
                </button>
              </form>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="tab-pane animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Payment History</h3>
                <button onClick={fetchRequests} className="refresh-btn">
                   Refresh
                </button>
              </div>
              
              {loadingRequests ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Loading history...</div>
              ) : (
                <div className="request-list">
                  {requests.filter(r => r.paymentStatus === 'approved' || r.paymentStatus === 'rejected').map((req) => (
                    <div key={req._id} className="request-card" style={{ borderLeft: `4px solid ${req.paymentStatus === 'approved' ? '#10b981' : '#ef4444'}` }}>
                      <div className="request-header">
                        <span className={`status-badge ${req.paymentStatus}`}>
                          {req.paymentStatus.toUpperCase()}
                        </span>
                        <span className="request-time">{new Date(req.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="request-body">
                        <div className="req-item"><strong>User:</strong> {req.fullName}</div>
                        <div className="req-item"><strong>Email:</strong> {req.email}</div>
                        <div className="req-item utr-box">
                          <strong>UTR:</strong> <code>{req.utr || 'N/A'}</code>
                        </div>
                        {req.paymentStatus === 'rejected' && (
                          <div className="req-item" style={{ marginTop: '8px', color: '#ef4444', fontSize: '0.8rem' }}>
                            <strong>Reason:</strong> {req.rejectionReason}
                          </div>
                        )}
                        {req.paymentStatus === 'approved' && req.activationKey && (
                          <div className="req-item" style={{ marginTop: '8px', color: '#10b981', fontSize: '0.8rem' }}>
                            <strong>Activation Key:</strong> <code>{req.activationKey}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {requests.filter(r => r.paymentStatus === 'approved' || r.paymentStatus === 'rejected').length === 0 && (
                    <div className="empty-state">No history found</div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom Navigation Bar */}
        <div className="admin-bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <div style={{ position: 'relative' }}>
              <ShieldIcon size={20} />
              {requests.filter(r => r.paymentStatus === 'pending' || !r.paymentStatus).length > 0 && (
                <span className="nav-badge"></span>
              )}
            </div>
            <span>Requests</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <UsersIcon size={20} />
            <span>Users</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Config</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <span>Upi</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
            <span>History</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'notice' ? 'active' : ''}`}
            onClick={() => setActiveTab('notice')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>Notice</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            <InstagramIcon size={20} />
            <span>Social</span>
          </button>
        </div>

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="modal-overlay animate-fade-in" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Select Rejection Reason</h3>
                <button className="close-modal" onClick={() => setShowRejectModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p className="modal-subtitle">Choose why this payment is being rejected:</p>
                <div className="reason-list">
                  {rejectionReasons.map((reason, idx) => (
                    <button 
                      key={idx} 
                      className="reason-item"
                      disabled={processingId === rejectUserId}
                      onClick={async () => {
                        setShowRejectModal(false);
                        await handleRequestAction(rejectUserId, 'rejected', reason);
                      }}
                    >
                      {processingId === rejectUserId ? 'Processing...' : reason}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-block" 
                style={{ marginTop: '20px', background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApproveModal && (
          <div className="modal-overlay animate-fade-in" onClick={() => setShowApproveModal(false)}>
            <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Approve Request</h3>
                <button className="close-modal" onClick={() => setShowApproveModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <p className="modal-subtitle">Enter the Activation Key to approve this user:</p>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter Activation Key"
                    value={activationKeyInput}
                    onChange={(e) => setActivationKeyInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}
                    onClick={() => setShowApproveModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', opacity: processingId === approveUserId ? 0.7 : 1 }}
                    disabled={processingId === approveUserId}
                    onClick={() => {
                      if (!activationKeyInput) {
                        toast.error('Please enter an activation key');
                        return;
                      }
                      handleRequestAction(approveUserId, 'approved', '', activationKeyInput);
                    }}
                  >
                    {processingId === approveUserId ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background-color: #e2e8f0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .admin-mobile-wrapper {
          width: 100%;
          max-width: 400px; /* Mobile phone width */
          height: 850px;
          max-height: 90vh;
          background-color: #f8faff;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          border: 8px solid #1e293b;
        }

        .admin-header {
          padding: 20px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 40px; /* Notch space */
        }
        
        .admin-header h2 {
          font-size: 1.2rem;
          margin: 0;
        }

        .admin-badge {
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 6px;
          display: flex;
        }

        .logout-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: bold;
          cursor: pointer;
        }

        .admin-tabs-scroll {
          overflow-x: auto;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          scrollbar-width: none;
        }
        
        .admin-tabs-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .admin-tabs {
          display: flex;
          padding: 8px;
          min-width: max-content;
        }

        .tab-btn {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px;
          background: transparent;
          border: none;
          font-weight: 600;
          color: #64748b;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .tab-btn.active {
          background: #eff6ff;
          color: #3b82f6;
        }

        .request-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .request-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status-badge {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.approved {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .request-time {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .req-item {
          font-size: 0.85rem;
          margin-bottom: 4px;
          color: #475569;
        }

        .utr-box {
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 8px;
          margin-top: 8px;
          border: 1px dashed #cbd5e1;
        }

        .utr-box code {
          color: #6366f1;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .request-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .action-btn {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.approve {
          background: #10b981;
          color: white;
        }

        .action-btn.reject {
          background: #ef4444;
          color: white;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          padding: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
        }

        .close-modal {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #94a3b8;
          cursor: pointer;
        }

        .modal-subtitle {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }

        .reason-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .reason-item {
          text-align: left;
          padding: 14px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #334155;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reason-item:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #991b1b;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .refresh-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
        }

        .admin-bottom-nav {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 10px;
          z-index: 100;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px;
          flex: 1;
        }

        .nav-item span {
          font-size: 0.65rem;
          font-weight: 700;
        }

        .nav-item.active {
          color: #6366f1;
        }

        .nav-item.active svg {
          transform: translateY(-2px);
          transition: transform 0.2s;
        }

        .admin-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8faff;
        }
        
        /* Hide scrollbar for clean mobile look */
        .admin-content::-webkit-scrollbar {
          width: 0px;
        }

        .tab-pane h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #1e293b;
          font-size: 1.1rem;
        }

        .user-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .user-card {
          background: white;
          padding: 15px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          background: #e0e7ff;
          color: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .user-info {
          flex: 1;
          overflow: hidden;
        }

        .user-info h4 {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-info p {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-date {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .settings-form {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }

        .admin-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 24px 0;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.95rem;
          transition: all 0.2s;
          outline: none;
        }

        .input-field:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          display: flex;
        }

        .with-icon {
          padding-left: 40px !important;
        }

        .message {
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 0.85rem;
          text-align: center;
        }

        .message.success {
          background: #dcfce7;
          color: #166534;
        }

        .message.error {
          background: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 480px) {
          .admin-container {
            padding: 0;
            background: #f8faff;
          }
          .admin-mobile-wrapper {
            border: none;
            border-radius: 0;
            height: 100vh;
            max-height: 100vh;
            max-width: 100%;
          }
          .admin-header {
            padding-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}
