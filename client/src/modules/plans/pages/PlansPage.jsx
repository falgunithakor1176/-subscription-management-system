/**
 * PlansPage.jsx
 * Enterprise Subscription Plan Management page in SubManage.
 * Provides role-based access:
 *  - ADMIN: Full access (create, edit, deactivate, view all)
 *  - STAFF: Operational view of active & inactive plans to prepare quotations
 *  - CUSTOMER: Self-service view of available active plans
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Edit2,
  Eye,
  Layers,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import PlanModal from '../components/PlanModal.jsx';
import {
  createPlanApi,
  deactivatePlanApi,
  getPlansApi,
  updatePlanApi,
} from '../services/plan.api.js';

const PlansPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [plans, setPlans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [freqFilter, setFreqFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Plan Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deactivate confirm state
  const [deactivatingPlan, setDeactivatingPlan] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        billingFrequency: freqFilter !== 'ALL' ? freqFilter : undefined,
        status: !isCustomer && statusFilter !== 'ALL' ? statusFilter : undefined,
      };

      const res = await getPlansApi(params);
      if (res.success && res.data) {
        setPlans(res.data.plans || []);
        setTotal(res.data.total || 0);
      } else {
        setPlans([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError(err.message || 'Failed to load subscription plans.');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [page, freqFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPlans();
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan, e) => {
    e.stopPropagation();
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (formData) => {
    setIsSaving(true);
    setError('');
    try {
      if (editingPlan) {
        await updatePlanApi(editingPlan.id, formData);
        setSuccessMessage('Subscription plan updated successfully.');
      } else {
        await createPlanApi(formData);
        setSuccessMessage('Subscription plan created successfully.');
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      fetchPlans();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save subscription plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingPlan) return;
    setIsDeactivating(true);
    try {
      await deactivatePlanApi(deactivatingPlan.id);
      setSuccessMessage(`Plan "${deactivatingPlan.name}" was deactivated.`);
      setDeactivatingPlan(null);
      fetchPlans();
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

  return (
    <div className="plans-page">
      {/* Page Header */}
      <PageHeader
        title="Subscription Plans"
        subtitle={
          isCustomer
            ? 'Browse available subscription tiers and recurring billing schedules.'
            : 'Configure recurring pricing models, billing cadences, and automated renewal rules.'
        }
        breadcrumbs={[
          { label: 'Workspace', path: '/dashboard' },
          { label: 'Subscription Plans' },
        ]}
        actions={
          isAdmin && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleCreatePlan}
              id="btn-create-plan"
            >
              <Plus size={16} />
              <span>Create Plan</span>
            </button>
          )
        }
      />

      {/* Notifications */}
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

      {/* Toolbar: Search & Filters */}
      <div className="toolbar" style={{ marginBottom: '16px' }}>
        <form onSubmit={handleSearchSubmit} className="toolbar__search-form">
          <div className="search-box">
            <Search size={16} className="search-box__icon" />
            <input
              type="text"
              className="search-box__input"
              placeholder="Search plans by name, product, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--secondary" style={{ height: '36px' }}>
            Search
          </button>
        </form>

        <div className="toolbar__filters" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Frequency filter */}
          <div className="filter-group">
            <label className="filter-label">Cycle:</label>
            <select
              className="form-select filter-select"
              value={freqFilter}
              onChange={(e) => {
                setFreqFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Frequencies</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          {/* Status filter (hidden for customer) */}
          {!isCustomer && (
            <div className="filter-group">
              <label className="filter-label">Status:</label>
              <select
                className="form-select filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="table-loading-state" style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
            <p style={{ color: '#64748B', fontSize: '14px' }}>Loading subscription plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px', textAlign: 'center' }}>
            <CalendarDays size={44} style={{ color: '#94A3B8', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              No subscription plans found
            </h3>
            <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '400px', margin: '0 auto 20px' }}>
              {search || freqFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter options.'
                : 'Get started by creating your first recurring billing plan.'}
            </p>
            {isAdmin && (
              <button type="button" className="btn btn--primary" onClick={handleCreatePlan}>
                <Plus size={16} />
                <span>Create Subscription Plan</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Plan Name</th>
                  <th style={{ width: '22%' }}>Linked Product</th>
                  <th style={{ width: '16%' }}>Recurring Price</th>
                  <th style={{ width: '12%' }}>Billing Cadence</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="clickable-row"
                    onClick={() => navigate(`/plans/${plan.id}`)}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '14px' }}>
                          {plan.name}
                        </span>
                        {plan.description && (
                          <span
                            style={{
                              color: '#64748B',
                              fontSize: '12px',
                              marginTop: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '300px',
                            }}
                          >
                            {plan.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={14} style={{ color: '#64748B' }} />
                        <span style={{ color: '#334155', fontSize: '13px', fontWeight: 500 }}>
                          {plan.product?.name || plan.productName || 'Standard Product'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                          {formatPrice(plan.price)}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          / {plan.billingFrequency ? plan.billingFrequency.toLowerCase() : 'mo'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {plan.billingFrequency}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={plan.status} />
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Details"
                          onClick={() => navigate(`/plans/${plan.id}`)}
                        >
                          <Eye size={15} />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit Plan"
                              onClick={(e) => handleEditPlan(plan, e)}
                            >
                              <Edit2 size={15} />
                            </button>
                            {plan.status !== 'INACTIVE' && (
                              <button
                                type="button"
                                className="btn-icon btn-icon--danger"
                                title="Deactivate Plan"
                                onClick={() => setDeactivatingPlan(plan)}
                              >
                                <Trash2 size={15} />
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

        {/* Pagination summary */}
        {!isLoading && plans.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
              color: '#64748B',
            }}
          >
            <span>
              Showing {plans.length} of {total} subscription plans
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
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
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Plan Create/Edit Modal */}
      {isModalOpen && (
        <PlanModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlan(null);
          }}
          onSave={handleSavePlan}
          initialData={editingPlan}
          isLoading={isSaving}
        />
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivatingPlan && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-header__title">Deactivate Plan</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to deactivate <strong>"{deactivatingPlan.name}"</strong>?
              </p>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                Inactive plans are hidden from new customer subscriptions and quotation selections, but existing active subscriptions remain intact.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setDeactivatingPlan(null)}
                disabled={isDeactivating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleConfirmDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating ? 'Deactivating...' : 'Deactivate Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
