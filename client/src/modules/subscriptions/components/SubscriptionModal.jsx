/**
 * SubscriptionModal.jsx
 * Modal for creating and provisioning customer subscriptions (Staff/Admin).
 */

import { useEffect, useState } from 'react';
import { AlertCircle, Calendar, DollarSign, Loader2, RefreshCw, X } from 'lucide-react';
import { getCustomersApi } from '../../customers/services/customer.api.js';
import { getDemoCustomers } from '../../customers/services/demoCustomers.js';
import { getPlansApi } from '../../plans/services/plan.api.js';
import { getDemoPlans } from '../../plans/services/demoPlans.js';

const SubscriptionModal = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('MONTHLY');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const cRes = await getCustomersApi({ limit: 100, status: 'ACTIVE' });
        setCustomers(cRes?.data?.customers?.length ? cRes.data.customers : getDemoCustomers());
      } catch (e) {
        setCustomers(getDemoCustomers());
      }

      try {
        const pRes = await getPlansApi({ limit: 100, status: 'ACTIVE' });
        setPlans(pRes?.data?.plans?.length ? pRes.data.plans : getDemoPlans());
      } catch (e) {
        setPlans(getDemoPlans());
      }
    };
    if (isOpen) load();
  }, [isOpen]);

  const handlePlanSelect = (id) => {
    setPlanId(id);
    const p = plans.find((item) => item.id === id);
    if (p?.billingFrequency) {
      setBillingFrequency(p.billingFrequency);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId || !planId) {
      setError('Please select both a customer and a subscription plan.');
      return;
    }

    const selectedPlan = plans.find((p) => p.id === planId);

    onSave({
      customerId,
      planId,
      billingFrequency,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      notes,
      items: [
        {
          productId: selectedPlan?.productId || 'prod-001',
          productName: selectedPlan?.name || 'Service',
          quantity: 1,
          unitPrice: selectedPlan?.price || 0,
        },
      ],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div className="modal-header__info">
            <h2 className="modal-header__title">Create Subscription</h2>
            <p className="modal-header__subtitle">
              Provision recurring service contract for an active client.
            </p>
          </div>
          <button type="button" className="modal-header__close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert--danger">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Client Account *</label>
              <select
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choose Client --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.companyName || c.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subscription Plan *</label>
              <select
                className="form-select"
                value={planId}
                onChange={(e) => handlePlanSelect(e.target.value)}
                required
              >
                <option value="">-- Choose Plan --</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.price} / {p.billingFrequency?.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Billing Cycle</label>
                <select
                  className="form-select"
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value)}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contract Notes (Optional)</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Internal billing stipulations or custom terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? 'Activating...' : 'Activate Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModal;
