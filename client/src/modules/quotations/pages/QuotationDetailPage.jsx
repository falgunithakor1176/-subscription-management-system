/**
 * QuotationDetailPage.jsx
 * Enterprise Quotation Document View inspired by Stripe Invoicing & Linear.
 * Provides full breakdown of items, financial totals, customer details, and role actions.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Edit2,
  FileCheck,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import QuotationModal from '../components/QuotationModal.jsx';
import {
  getQuotationByIdApi,
  updateQuotationApi,
  updateQuotationStatusApi,
} from '../services/quotation.api.js';

const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [quotation, setQuotation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchQuotation = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getQuotationByIdApi(id);
      if (res.success && res.data) {
        setQuotation(res.data);
      } else {
        setError('Quotation record not found.');
      }
    } catch (err) {
      console.error('Failed to load quote details:', err);
      setError(err.message || 'Failed to load quotation.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleUpdate = async (formData) => {
    setIsSaving(true);
    try {
      await updateQuotationApi(id, formData);
      setSuccessMessage('Quotation updated successfully.');
      setIsEditOpen(false);
      await fetchQuotation();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status, reason = null) => {
    setIsProcessingAction(true);
    try {
      await updateQuotationStatusApi(id, status, reason);
      setSuccessMessage(`Quotation status changed to ${status}.`);
      await fetchQuotation();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Open-ended (No expiry)';
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
        <p style={{ color: '#64748B', fontSize: '14px' }}>Loading quotation document...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="alert alert--danger">
          <AlertCircle size={18} />
          <span>{error || 'Quotation not found.'}</span>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          style={{ marginTop: '16px' }}
          onClick={() => navigate('/quotations')}
        >
          <ArrowLeft size={16} />
          <span>Back to Quotations</span>
        </button>
      </div>
    );
  }

  const customerName = quotation.customer?.firstName
    ? `${quotation.customer.firstName} ${quotation.customer.lastName}`
    : quotation.customerName || 'Direct Client';

  const customerCompany = quotation.customer?.companyName || quotation.customerCompany;
  const customerEmail = quotation.customer?.email || quotation.customerEmail;
  const customerPhone = quotation.customer?.phone;

  return (
    <div className="quotation-detail-page">
      {/* Page Header */}
      <PageHeader
        title={`Quotation ${quotation.quotationNumber}`}
        subtitle={`Prepared for ${customerName} · Status: ${quotation.status}`}
        breadcrumbs={[
          { label: 'Workspace', path: '/dashboard' },
          { label: 'Quotations', path: '/quotations' },
          { label: quotation.quotationNumber },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/quotations')}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            {/* Staff / Admin Actions */}
            {(isAdmin || isStaff) && quotation.status === 'DRAFT' && (
              <>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit2 size={15} />
                  <span>Edit Draft</span>
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => handleStatusChange('SENT')}
                  disabled={isProcessingAction}
                >
                  <Send size={15} />
                  <span>Send to Client</span>
                </button>
              </>
            )}

            {/* Customer Actions */}
            {isCustomer && quotation.status === 'SENT' && (
              <>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={isProcessingAction}
                >
                  <XCircle size={15} />
                  <span>Reject Proposal</span>
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  style={{ backgroundColor: '#16A34A' }}
                  onClick={() => handleStatusChange('ACCEPTED')}
                  disabled={isProcessingAction}
                >
                  <FileCheck size={15} />
                  <span>Accept & Confirm</span>
                </button>
              </>
            )}

            {/* Convert to Subscription for Staff / Admin if Accepted */}
            {(isAdmin || isStaff) && quotation.status === 'ACCEPTED' && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setSuccessMessage('Ready to convert to active subscription pipeline.');
                }}
              >
                <RefreshCw size={15} />
                <span>Convert to Subscription</span>
              </button>
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

      {/* Printable / Document Card Container */}
      <Card style={{ padding: '32px', marginBottom: '24px' }}>
        {/* Document Top Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '24px',
            borderBottom: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                S
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                SubManage SaaS
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
              Enterprise Cloud & Billing Solutions<br />
              billing@submanage.io · +1 (800) 555-0199
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Official Estimate
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '2px 0 6px' }}>
              {quotation.quotationNumber}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <StatusBadge status={quotation.status} />
            </div>
          </div>
        </div>

        {/* Client & Metadata Two-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            padding: '24px 0',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          {/* Bill To */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em' }}>
              Quotation Prepared For
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '4px', marginBottom: '2px' }}>
              {customerName}
            </h3>
            {customerCompany && (
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#4F46E5', margin: 0 }}>
                {customerCompany}
              </p>
            )}
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span>{customerEmail}</span>
              {customerPhone && <span>{customerPhone}</span>}
              {quotation.customer?.address && (
                <span>
                  {quotation.customer.address}, {quotation.customer.city}
                </span>
              )}
            </div>
          </div>

          {/* Schedule & Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#64748B' }}>Issue Date:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatDate(quotation.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#64748B' }}>Valid Until:</span>
              <span style={{ fontWeight: 600, color: '#DC2626' }}>{formatDate(quotation.validityDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#64748B' }}>Payment Terms:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Net 30 Days</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ padding: '24px 0 16px', overflowX: 'auto' }}>
          <table className="shared-data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '38%' }}>Item & Description</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Unit Price</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Discount</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Tax</th>
                <th style={{ width: '16%', textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(quotation.items || []).map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                        {item.product?.name || item.productName || 'Service'}
                      </span>
                      {(item.variant?.name || item.variantName) && (
                        <span style={{ fontSize: '12px', color: '#4F46E5' }}>
                          Variant: {item.variant?.name || item.variantName}
                        </span>
                      )}
                      {item.description && (
                        <span style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', color: '#475569' }}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td style={{ textAlign: 'right', color: item.discountPct > 0 ? '#16A34A' : '#94A3B8' }}>
                    {item.discountPct > 0 ? `${item.discountPct}%` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', color: '#64748B' }}>
                    {item.taxPct > 0 ? `${item.taxPct}%` : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Financial Totals & Terms */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            paddingTop: '20px',
            alignItems: 'start',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em' }}>
              Terms & Customer Instructions
            </span>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginTop: '6px' }}>
              {quotation.notes ||
                'This quotation is subject to Brightloop standard subscription licensing terms. All prices quoted in USD. Accepting this quote will convert it into an active subscription schedule.'}
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>
                {formatCurrency(quotation.subtotal)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16A34A' }}>
              <span>Discounts Applied</span>
              <span style={{ fontWeight: 600 }}>
                -{formatCurrency(quotation.discountAmount)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
              <span>Taxes (Estimated)</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>
                +{formatCurrency(quotation.taxAmount)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 700,
                color: '#0F172A',
                paddingTop: '10px',
                borderTop: '1px solid #E2E8F0',
              }}
            >
              <span>Grand Total</span>
              <span style={{ color: '#4F46E5' }}>{formatCurrency(quotation.totalAmount)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      {isEditOpen && (
        <QuotationModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleUpdate}
          initialData={quotation}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default QuotationDetailPage;
