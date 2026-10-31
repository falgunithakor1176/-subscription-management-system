/**
 * QuotationsPage.jsx
 * Enterprise Quotation Management directory inspired by Stripe Dashboard & Linear.
 * Role-Based Features:
 *  - ADMIN & STAFF: Create quotes, edit drafts, send quotes to clients, track pipeline
 *  - CUSTOMER: View their own quotations, accept or reject proposals directly
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  Edit2,
  Eye,
  FileCheck,
  FileText,
  Loader2,
  Plus,
  Search,
  Send,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import QuotationModal from '../components/QuotationModal.jsx';
import {
  createQuotationApi,
  getQuotationsApi,
  updateQuotationApi,
  updateQuotationStatusApi,
} from '../services/quotation.api.js';

const QuotationsPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchQuotations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      };

      const res = await getQuotationsApi(params);
      if (res.success && res.data) {
        setQuotations(res.data.quotations || []);
        setTotal(res.data.total || 0);
      } else {
        setQuotations([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to load quotations:', err);
      setError(err.message || 'Failed to load quotations.');
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuotations();
  };

  const handleCreateQuotation = () => {
    setEditingQuotation(null);
    setIsModalOpen(true);
  };

  const handleEditQuotation = (quote, e) => {
    e.stopPropagation();
    setEditingQuotation(quote);
    setIsModalOpen(true);
  };

  const handleSaveQuotation = async (formData) => {
    setIsSaving(true);
    try {
      if (editingQuotation) {
        await updateQuotationApi(editingQuotation.id, formData);
        setSuccessMessage('Quotation updated successfully.');
      } else {
        await createQuotationApi(formData);
        setSuccessMessage('Quotation created successfully as DRAFT.');
      }
      setIsModalOpen(false);
      setEditingQuotation(null);
      await fetchQuotations();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save quotation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusChange = async (quoteId, status, e) => {
    e.stopPropagation();
    try {
      await updateQuotationStatusApi(quoteId, status);
      setSuccessMessage(`Quotation marked as ${status}.`);
      await fetchQuotations();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update quotation status.');
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Open-ended';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="quotations-page">
      {/* Page Header */}
      <PageHeader
        title="Quotations"
        subtitle={
          isCustomer
            ? 'Review proposals, pricing estimates, and approve agreements.'
            : 'Prepare estimates, configure line items, and convert accepted quotes to active subscriptions.'
        }
        breadcrumbs={[
          { label: 'Workspace', path: '/dashboard' },
          { label: 'Quotations' },
        ]}
        actions={
          (isAdmin || isStaff) && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleCreateQuotation}
              id="btn-create-quote"
            >
              <Plus size={16} />
              <span>Create Quotation</span>
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

      {/* Toolbar: Search & Status Filters */}
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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by quote #, client, or terms..."
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
            {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].map((st) => (
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

      {/* Main Table Card */}
      <Card padding="none">
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
            <p style={{ color: '#64748B', fontSize: '14px' }}>Loading quotations...</p>
          </div>
        ) : quotations.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText size={44} style={{ color: '#94A3B8', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              No quotations found
            </h3>
            <p style={{ color: '#64748B', fontSize: '13.5px', maxWidth: '380px', margin: '0 auto 18px' }}>
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter pills.'
                : 'Get started by creating your first customer estimate.'}
            </p>
            {(isAdmin || isStaff) && !search && (
              <button type="button" className="btn btn--primary" onClick={handleCreateQuotation}>
                <Plus size={16} />
                <span>Create Quotation</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="shared-data-table" aria-label="Quotations list">
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>Quote Number</th>
                  <th style={{ width: '28%' }}>Customer</th>
                  <th style={{ width: '12%' }}>Items</th>
                  <th style={{ width: '16%' }}>Validity Date</th>
                  <th style={{ width: '14%' }}>Grand Total</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr
                    key={q.id}
                    className="shared-data-table__row--clickable"
                    onClick={() => navigate(`/quotations/${q.id}`)}
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
                          <FileText size={15} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                          {q.quotationNumber}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                          {q.customer?.firstName
                            ? `${q.customer.firstName} ${q.customer.lastName}`
                            : q.customerName || 'Direct Client'}
                        </span>
                        {(q.customer?.companyName || q.customerCompany) && (
                          <span style={{ fontSize: '12px', color: '#64748B' }}>
                            {q.customer?.companyName || q.customerCompany}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#475569' }}>
                        {q.items?.length || q._count?.items || 1} item(s)
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>
                        {formatDate(q.validityDate)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px' }}>
                        {formatCurrency(q.totalAmount)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={q.status} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Quotation"
                          onClick={() => navigate(`/quotations/${q.id}`)}
                        >
                          <Eye size={15} />
                        </button>

                        {(isAdmin || isStaff) && q.status === 'DRAFT' && (
                          <>
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit Quotation"
                              onClick={(e) => handleEditQuotation(q, e)}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ color: '#4F46E5' }}
                              title="Send to Customer"
                              onClick={(e) => handleQuickStatusChange(q.id, 'SENT', e)}
                            >
                              <Send size={15} />
                            </button>
                          </>
                        )}

                        {isCustomer && q.status === 'SENT' && (
                          <>
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ color: '#16A34A' }}
                              title="Accept Quotation"
                              onClick={(e) => handleQuickStatusChange(q.id, 'ACCEPTED', e)}
                            >
                              <FileCheck size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon--danger"
                              title="Reject Quotation"
                              onClick={(e) => handleQuickStatusChange(q.id, 'REJECTED', e)}
                            >
                              <XCircle size={15} />
                            </button>
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
        {!isLoading && quotations.length > 0 && (
          <div className="shared-data-table__pagination">
            <span>
              Showing {quotations.length} of {total} quotations
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <QuotationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingQuotation(null);
          }}
          onSave={handleSaveQuotation}
          initialData={editingQuotation}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default QuotationsPage;
