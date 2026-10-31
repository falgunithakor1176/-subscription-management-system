/**
 * SubscriptionsPage.jsx
 * Enterprise Subscription Management directory.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  Eye,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import SubscriptionModal from '../components/SubscriptionModal.jsx';
import {
  createSubscriptionApi,
  getSubscriptionsApi,
  updateSubscriptionStatusApi,
} from '../services/subscription.api.js';

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      };

      const res = await getSubscriptionsApi(params);
      if (res.success && res.data) {
        setSubscriptions(res.data.subscriptions || []);
        setTotal(res.data.total || 0);
      } else {
        setSubscriptions([]);
        setTotal(0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load subscriptions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  const handleCreate = async (formData) => {
    setIsSaving(true);
    try {
      await createSubscriptionApi(formData);
      setSuccessMessage('Subscription activated successfully.');
      setIsModalOpen(false);
      await fetchSubscriptions();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to activate subscription.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id, status, e) => {
    e.stopPropagation();
    try {
      await updateSubscriptionStatusApi(id, status);
      setSuccessMessage(`Subscription marked as ${status}.`);
      await fetchSubscriptions();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="subscriptions-page">
      <PageHeader
        title="Subscriptions"
        subtitle={
          isCustomer
            ? 'Manage your active subscription schedules, renewals, and recurring commitments.'
            : 'Track the subscription pipeline, pause or renew services, and monitor recurring revenue.'
        }
        breadcrumbs={[
          { label: 'Workspace', path: '/dashboard' },
          { label: 'Subscriptions' },
        ]}
        actions={
          (isAdmin || isStaff) && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              <span>Create Subscription</span>
            </button>
          )
        }
      />

      {successMessage && (
        <div className="alert alert--success" style={{ marginBottom: '16px' }}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="alert alert--danger" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search subscriptions by number, client, or plan..."
              style={{ paddingLeft: '36px', height: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--secondary" style={{ height: '36px', padding: '0 14px' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Status:</span>
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((st) => (
              <button
                key={st}
                type="button"
                style={{
                  background: statusFilter === st ? '#FFFFFF' : 'transparent',
                  color: statusFilter === st ? '#0F172A' : '#64748B',
                  fontWeight: statusFilter === st ? 600 : 500,
                  boxShadow: statusFilter === st ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card padding="none">
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
            <p style={{ color: '#64748B', fontSize: '14px' }}>Loading subscription pipeline...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <RefreshCw size={44} style={{ color: '#94A3B8', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              No subscriptions found
            </h3>
            <p style={{ color: '#64748B', fontSize: '13.5px', maxWidth: '380px', margin: '0 auto 18px' }}>
              {search ? 'Try adjusting your search query.' : 'No active or paused subscription schedules logged.'}
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="shared-data-table">
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>Subscription #</th>
                  <th style={{ width: '26%' }}>Client</th>
                  <th style={{ width: '22%' }}>Plan</th>
                  <th style={{ width: '14%' }}>Cadence / Amount</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr
                    key={s.id}
                    className="shared-data-table__row--clickable"
                    onClick={() => navigate(`/subscriptions/${s.id}`)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#EEF2FF',
                            color: '#4F46E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <RefreshCw size={15} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                          {s.subscriptionNumber}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                          {s.customer?.firstName
                            ? `${s.customer.firstName} ${s.customer.lastName}`
                            : s.customerName}
                        </span>
                        {(s.customer?.companyName || s.customerCompany) && (
                          <span style={{ fontSize: '12px', color: '#64748B' }}>
                            {s.customer?.companyName || s.customerCompany}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#334155', fontSize: '13px' }}>
                        {s.plan?.name || s.planName}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                          {formatCurrency(s.amount)}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          /{s.billingFrequency?.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Subscription"
                          onClick={() => navigate(`/subscriptions/${s.id}`)}
                        >
                          <Eye size={15} />
                        </button>
                        {(isAdmin || isStaff) && (
                          <>
                            {s.status === 'ACTIVE' && (
                              <button
                                type="button"
                                className="btn-icon"
                                title="Pause Subscription"
                                onClick={(e) => handleStatusChange(s.id, 'PAUSED', e)}
                              >
                                <Pause size={14} />
                              </button>
                            )}
                            {s.status === 'PAUSED' && (
                              <button
                                type="button"
                                className="btn-icon"
                                style={{ color: '#16A34A' }}
                                title="Resume Subscription"
                                onClick={(e) => handleStatusChange(s.id, 'ACTIVE', e)}
                              >
                                <Play size={14} />
                              </button>
                            )}
                            {s.status !== 'CLOSED' && (
                              <button
                                type="button"
                                className="btn-icon btn-icon--danger"
                                title="Close Contract"
                                onClick={(e) => handleStatusChange(s.id, 'CLOSED', e)}
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && subscriptions.length > 0 && (
          <div className="shared-data-table__pagination">
            <span>
              Showing {subscriptions.length} of {total} subscriptions
            </span>
            <div className="shared-data-table__pagination-buttons">
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <SubscriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreate}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;
