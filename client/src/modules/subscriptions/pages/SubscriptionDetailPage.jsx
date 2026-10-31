/**
 * SubscriptionDetailPage.jsx
 * Enterprise Subscription Detail Overview.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Loader2,
  Package,
  Pause,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import {
  getSubscriptionByIdApi,
  updateSubscriptionStatusApi,
} from '../services/subscription.api.js';

const SubscriptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [sub, setSub] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSub = async () => {
    setIsLoading(true);
    try {
      const res = await getSubscriptionByIdApi(id);
      if (res.success && res.data) {
        setSub(res.data);
      } else {
        setError('Subscription not found.');
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch subscription.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSub();
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await updateSubscriptionStatusApi(id, status);
      setSuccessMessage(`Subscription status updated to ${status}.`);
      await fetchSub();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e) {
      setError(e.message || 'Failed to update status.');
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Open-ended';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
        <p style={{ color: '#64748B', fontSize: '14px' }}>Loading subscription...</p>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="alert alert--danger">
          <AlertCircle size={18} />
          <span>{error || 'Subscription not found.'}</span>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          style={{ marginTop: '16px' }}
          onClick={() => navigate('/subscriptions')}
        >
          <ArrowLeft size={16} />
          <span>Back to Subscriptions</span>
        </button>
      </div>
    );
  }

  return (
    <div className="subscription-detail-page">
      <PageHeader
        title={`Subscription ${sub.subscriptionNumber}`}
        subtitle={`Plan: ${sub.plan?.name || sub.planName} · Client: ${sub.customer?.firstName ? `${sub.customer.firstName} ${sub.customer.lastName}` : sub.customerName}`}
        breadcrumbs={[
          { label: 'Workspace', path: '/dashboard' },
          { label: 'Subscriptions', path: '/subscriptions' },
          { label: sub.subscriptionNumber },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/subscriptions')}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            {(isAdmin || isStaff) && (
              <>
                {sub.status === 'ACTIVE' && (
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => handleStatusChange('PAUSED')}
                  >
                    <Pause size={15} />
                    <span>Pause</span>
                  </button>
                )}
                {sub.status === 'PAUSED' && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => handleStatusChange('ACTIVE')}
                  >
                    <Play size={15} />
                    <span>Resume</span>
                  </button>
                )}
                {sub.status !== 'CLOSED' && (
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => handleStatusChange('CLOSED')}
                  >
                    <XCircle size={15} />
                    <span>Close Contract</span>
                  </button>
                )}
              </>
            )}
          </div>
        }
      />

      {successMessage && (
        <div className="alert alert--success" style={{ marginBottom: '16px' }}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <Card title="Billing & Commitment">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A' }}>
                {formatCurrency(sub.amount)}
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                / {sub.billingFrequency?.toLowerCase()}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Status</span>
                <div><StatusBadge status={sub.status} /></div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Cadence</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{sub.billingFrequency}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Timeline & Cycles">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Start Date:</span>
              <span style={{ fontWeight: 600 }}>{formatDate(sub.startDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>End Date:</span>
              <span style={{ fontWeight: 600 }}>{formatDate(sub.endDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Next Invoice Date:</span>
              <span style={{ fontWeight: 600, color: '#4F46E5' }}>{formatDate(sub.nextBillingDate)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Contract Items */}
      <Card title="Included Contract Items" padding="none">
        <table className="shared-data-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th style={{ textAlign: 'center' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(sub.items || []).map((it, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{it.product?.name || it.productName || 'Service'}</td>
                <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(it.unitPrice)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default SubscriptionDetailPage;
