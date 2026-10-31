/**
 * PlanDetailPage.jsx
 * Enterprise Plan Detail View in SubManage.
 * Displays plan settings, associated product info, pricing terms, and subscriptions summary.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Edit2,
  Layers,
  Loader2,
  Package,
  RefreshCw,
  Shield,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import PlanModal from '../components/PlanModal.jsx';
import {
  deactivatePlanApi,
  getPlanByIdApi,
  updatePlanApi,
} from '../services/plan.api.js';

const PlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate modal state
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const fetchPlan = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getPlanByIdApi(id);
      if (res.success && res.data) {
        setPlan(res.data);
      } else {
        setError('Subscription plan not found.');
      }
    } catch (err) {
      console.error('Failed to fetch plan:', err);
      setError(err.message || 'Failed to fetch subscription plan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const handleSavePlan = async (formData) => {
    setIsSaving(true);
    try {
      await updatePlanApi(id, formData);
      setSuccessMessage('Subscription plan updated successfully.');
      setIsEditModalOpen(false);
      fetchPlan();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await deactivatePlanApi(id);
      setSuccessMessage('Plan was deactivated.');
      setShowDeactivateModal(false);
      fetchPlan();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to deactivate plan.');
    } finally {
      setIsDeactivating(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'None (Open-ended)';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
        <p style={{ color: '#64748B', fontSize: '14px' }}>Loading plan details...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="alert alert--danger">
          <AlertCircle size={18} />
          <span>{error || 'Subscription plan not found.'}</span>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          style={{ marginTop: '16px' }}
          onClick={() => navigate('/plans')}
        >
          <ArrowLeft size={16} />
          <span>Back to Subscription Plans</span>
        </button>
      </div>
    );
  }

  return (
    <div className="plan-detail-page">
      {/* Page Header */}
      <PageHeader
        title={plan.name}
        subtitle={`Billing Schedule: ${plan.billingFrequency} · Minimum Quantity: ${plan.minQuantity}`}
        breadcrumbs={[
          { label: 'Workspace', path: '/dashboard' },
          { label: 'Subscription Plans', path: '/plans' },
          { label: plan.name },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/plans')}
            >
              <ArrowLeft size={16} />
              <span>Back to Plans</span>
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 size={16} />
                  <span>Edit Plan</span>
                </button>
                {plan.status !== 'INACTIVE' && (
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => setShowDeactivateModal(true)}
                  >
                    <Trash2 size={16} />
                    <span>Deactivate</span>
                  </button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* Notifications */}
      {successMessage && (
        <div className="alert alert--success" style={{ marginBottom: '16px' }}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Hero Overview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1: Pricing & Terms */}
        <Card title="Pricing & Cadence">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                paddingBottom: '16px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <span style={{ fontSize: '32px', fontWeight: 700, color: '#0F172A' }}>
                {formatPrice(plan.price)}
              </span>
              <span style={{ fontSize: '14px', color: '#64748B' }}>
                / {plan.billingFrequency?.toLowerCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Billing Frequency
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  {plan.billingFrequency}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Status
                </span>
                <StatusBadge status={plan.status} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Minimum Quantity
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  {plan.minQuantity} unit{plan.minQuantity > 1 ? 's' : ''}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                  Auto-Close Upon Expiry
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: plan.autoClose ? '#DC2626' : '#16A34A',
                  }}
                >
                  {plan.autoClose ? 'Enabled' : 'Disabled (Auto-Renews)'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Validity Window */}
        <Card title="Validity & Dates">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                Start Date
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} style={{ color: '#4F46E5' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>
                  {formatDate(plan.startDate)}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                End Date (Expiration)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} style={{ color: '#64748B' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A' }}>
                  {formatDate(plan.endDate)}
                </span>
              </div>
            </div>

            <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
                Plan Description
              </span>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                {plan.description || 'No description specified for this subscription plan.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Card 3: Associated Product Catalog Item */}
        <Card title="Associated Product">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4F46E5',
                }}
              >
                <Package size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  {plan.product?.name || plan.productName || 'Standard Product'}
                </h4>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Catalog ID: {plan.productId}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>
              This plan defines the standard recurring terms for customers subscribing to this product catalog item.
            </p>

            <Link
              to={`/products/${plan.productId}`}
              className="btn btn--secondary btn--sm"
              style={{ alignSelf: 'flex-start', marginTop: '6px' }}
            >
              <span>View Product Details</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <PlanModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSavePlan}
          initialData={plan}
          isLoading={isSaving}
        />
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-header__title">Deactivate Plan</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#334155' }}>
                Are you sure you want to deactivate <strong>"{plan.name}"</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowDeactivateModal(false)}
                disabled={isDeactivating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanDetailPage;
