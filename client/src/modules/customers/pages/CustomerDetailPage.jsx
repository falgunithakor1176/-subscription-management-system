/**
 * CustomerDetailPage.jsx
 * Detailed customer overview displaying customer identity, billing address,
 * internal notes, and linked subscription & invoice summary cards.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Edit2,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  User,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import CustomerModal from '../components/CustomerModal.jsx';
import {
  getCustomerByIdApi,
  updateCustomerApi,
} from '../services/customer.api.js';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCustomer = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getCustomerByIdApi(id);
      if (response.success && response.data?.customer) {
        setCustomer(response.data.customer);
      } else {
        setError('Customer record not found.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load customer profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleUpdate = async (formData) => {
    setIsSaving(true);
    try {
      await updateCustomerApi(id, formData);
      await fetchCustomer();
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${f}${l}` || 'CU';
  };

  if (isLoading) {
    return (
      <div className="table-loading-state" style={{ minHeight: '300px' }}>
        <Loader2 size={32} className="spin" />
        <span>Loading customer profile...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="customer-detail-view">
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => navigate('/customers')}
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </button>
        <div className="alert-banner alert-banner--danger">
          <AlertCircle size={16} />
          <span>{error || 'Customer not found.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-detail-view">
      {/* Top back navigation */}
      {!isCustomer && (
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => navigate('/customers')}
          style={{ marginBottom: '20px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </button>
      )}

      {/* Profile Header Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-card__left">
          <div className="profile-avatar-large">
            {getInitials(customer.firstName, customer.lastName)}
          </div>
          <div>
            <div className="profile-hero-card__title-row">
              <h1 className="profile-hero-card__name">
                {customer.firstName} {customer.lastName}
              </h1>
              <span
                className={`status-pill ${
                  customer.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'
                }`}
              >
                <span className="status-pill__dot" />
                {customer.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
            </div>

            {customer.companyName && (
              <p className="profile-hero-card__company">
                <Building2 size={16} />
                <span>{customer.companyName}</span>
              </p>
            )}

            <div className="profile-hero-card__tags">
              <span className="contact-tag">
                <Mail size={14} />
                <span>{customer.email}</span>
              </span>
              {customer.phone && (
                <span className="contact-tag">
                  <Phone size={14} />
                  <span>{customer.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setIsEditOpen(true)}
        >
          <Edit2 size={15} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="detail-cards-grid">
        {/* Left Column: Address and Notes */}
        <div className="detail-card">
          <div className="detail-card__header">
            <MapPin size={18} className="detail-card__icon" />
            <h3 className="detail-card__title">Billing & Physical Address</h3>
          </div>
          <div className="detail-card__body">
            {customer.address || customer.city || customer.country ? (
              <div className="address-block">
                <p className="address-line">{customer.address || 'No street address provided'}</p>
                <p className="address-line">
                  {[customer.city, customer.state, customer.postalCode].filter(Boolean).join(', ')}
                </p>
                <p className="address-line address-line--country">
                  {customer.country || 'United States'}
                </p>
              </div>
            ) : (
              <p className="cell-text-muted">No billing address on file.</p>
            )}
          </div>

          <div className="detail-card__divider" />

          <div className="detail-card__header">
            <FileText size={18} className="detail-card__icon" />
            <h3 className="detail-card__title">Internal Notes</h3>
          </div>
          <div className="detail-card__body">
            <p className="notes-text">
              {customer.notes || 'No internal notes recorded for this customer.'}
            </p>
          </div>
        </div>

        {/* Right Column: Linked Subscriptions & Financial Summary */}
        <div className="detail-card">
          <div className="detail-card__header">
            <RefreshCw size={18} className="detail-card__icon" />
            <h3 className="detail-card__title">Active Subscriptions</h3>
          </div>
          <div className="detail-card__body">
            <div className="summary-empty-state">
              <RefreshCw size={28} className="summary-empty-state__icon" />
              <p className="summary-empty-state__title">Subscriptions Module Ready</p>
              <p className="summary-empty-state__text">
                Subscriptions linked to this customer will automatically appear here once Module 6 is activated.
              </p>
            </div>
          </div>

          <div className="detail-card__divider" />

          <div className="detail-card__header">
            <CreditCard size={18} className="detail-card__icon" />
            <h3 className="detail-card__title">Invoices & Payments</h3>
          </div>
          <div className="detail-card__body">
            <div className="summary-empty-state">
              <CreditCard size={28} className="summary-empty-state__icon" />
              <p className="summary-empty-state__title">Invoices & Payments Ready</p>
              <p className="summary-empty-state__text">
                Invoices, recurring billing runs, and recorded payments will link directly to this profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <CustomerModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdate}
        initialData={customer}
        isLoading={isSaving}
      />
    </div>
  );
};

export default CustomerDetailPage;
