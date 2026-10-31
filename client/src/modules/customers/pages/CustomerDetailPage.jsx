/**
 * CustomerDetailPage.jsx
 * Enterprise Customer Detail Overview inspired by Stripe Dashboard & Linear.
 * Displays customer identity, billing address, internal notes, and linked subscription & invoice summary cards.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
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
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import CustomerModal from '../components/CustomerModal.jsx';
import {
  getCustomerByIdApi,
  updateCustomerApi,
} from '../services/customer.api.js';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
      setSuccessMessage('Customer profile updated successfully.');
      await fetchCustomer();
      setIsEditOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update profile.');
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
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
        <p style={{ color: '#64748B', fontSize: '14px' }}>Loading customer profile...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="alert alert--danger">
          <AlertCircle size={18} />
          <span>{error || 'Customer profile not found.'}</span>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          style={{ marginTop: '16px' }}
          onClick={() => navigate(isCustomer ? '/dashboard' : '/customers')}
        >
          <ArrowLeft size={16} />
          <span>Back to {isCustomer ? 'Workspace' : 'Customers'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="customer-detail-view">
      {/* Shared Page Header */}
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        subtitle={customer.companyName ? `${customer.companyName} · Customer ID: ${customer.id}` : `Customer ID: ${customer.id}`}
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          ...(!isCustomer ? [{ label: 'Customers', to: '/customers' }] : []),
          { label: `${customer.firstName} ${customer.lastName}` },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isCustomer && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => navigate('/customers')}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 size={15} />
              <span>Edit Profile</span>
            </button>
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

      {/* Hero Overview Card */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {getInitials(customer.firstName, customer.lastName)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {customer.firstName} {customer.lastName}
                </h2>
                <StatusBadge status={customer.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
                  <Mail size={14} />
                  <span>{customer.email}</span>
                </span>
                {customer.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
                    <Phone size={14} />
                    <span>{customer.phone}</span>
                  </span>
                )}
                {customer.companyName && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
                    <Building2 size={14} />
                    <span>{customer.companyName}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: 2 Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: Address and Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Billing & Physical Address">
            {customer.address || customer.city || customer.country ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13.5px', color: '#334155' }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{customer.address || 'No street address specified'}</p>
                <p style={{ margin: 0 }}>
                  {[customer.city, customer.state, customer.postalCode].filter(Boolean).join(', ')}
                </p>
                <p style={{ margin: 0, fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                  {customer.country || 'United States'}
                </p>
              </div>
            ) : (
              <p style={{ color: '#94A3B8', fontSize: '13.5px', margin: 0 }}>
                No billing address recorded for this customer.
              </p>
            )}
          </Card>

          <Card title="Internal Notes">
            <p style={{ color: customer.notes ? '#334155' : '#94A3B8', fontSize: '13.5px', lineHeight: 1.5, margin: 0 }}>
              {customer.notes || 'No internal notes recorded for this customer profile.'}
            </p>
          </Card>
        </div>

        {/* Right Column: Subscriptions & Financial Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Active Subscriptions">
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <RefreshCw size={32} style={{ color: '#94A3B8', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                No active subscriptions yet
              </h4>
              <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '300px', margin: '0 auto' }}>
                Subscriptions, recurring contracts, and billing pipelines will appear here once provisioned.
              </p>
            </div>
          </Card>

          <Card title="Invoices & Payment History">
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <CreditCard size={32} style={{ color: '#94A3B8', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                No invoice records found
              </h4>
              <p style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '300px', margin: '0 auto' }}>
                Generated invoices, payment transactions, and receipt receipts will be logged here.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {isEditOpen && (
        <CustomerModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleUpdate}
          initialData={customer}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default CustomerDetailPage;
