/**
 * CustomersPage.jsx
 * Enterprise Customer Management directory page inspired by Stripe & Linear.
 * Features search, status filtering, pagination, "+ Add Customer" modal,
 * edit customer, view details, and deactivation.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import CustomerModal from '../components/CustomerModal.jsx';
import {
  createCustomerApi,
  deleteCustomerApi,
  getCustomersApi,
  updateCustomerApi,
} from '../services/customer.api.js';

const CustomersPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isStaff } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm Modal
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Customers
  const fetchCustomers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      };
      const response = await getCustomersApi(params);
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
        setTotal(response.data.total || 0);
      } else {
        setCustomers([]);
        setTotal(0);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load customers.');
      setCustomers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    fetchCustomers();
  };

  // Create or Update
  const handleSaveCustomer = async (formData) => {
    setIsSaving(true);
    try {
      if (editingCustomer) {
        await updateCustomerApi(editingCustomer.id, formData);
        setSuccessMessage(`Customer "${formData.firstName} ${formData.lastName}" updated successfully.`);
      } else {
        await createCustomerApi(formData);
        setSuccessMessage(`Customer "${formData.firstName} ${formData.lastName}" created successfully.`);
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      await fetchCustomers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save customer.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // Open Edit
  const handleOpenEdit = (customer, e) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  // Open Create
  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  // Deactivate Customer
  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      await deleteCustomerApi(deletingCustomer.id);
      setSuccessMessage(`Customer "${deletingCustomer.firstName} ${deletingCustomer.lastName}" deactivated.`);
      setDeletingCustomer(null);
      await fetchCustomers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to deactivate customer.');
    } finally {
      setIsDeleting(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(customers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${f}${l}` || 'CU';
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="customers-page">
      {/* Shared Page Header */}
      <PageHeader
        title="Customers"
        subtitle="Manage your customer directory, billing profiles, and client accounts."
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Customers' },
        ]}
        actions={
          (isAdmin || isStaff) && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleOpenCreate}
              id="btn-add-customer"
            >
              <Plus size={16} />
              <span>Add Customer</span>
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

      {/* Filter & Search Toolbar */}
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
              placeholder="Search by name, email, company, or phone..."
              style={{ paddingLeft: '36px', height: '36px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--secondary" style={{ height: '36px', padding: '0 14px' }}>
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleClearSearch}
              style={{ height: '36px', padding: '0 10px' }}
            >
              Clear
            </button>
          )}
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Status:</span>
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
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
            <p style={{ color: '#64748B', fontSize: '14px' }}>Loading customers directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Users size={44} style={{ color: '#94A3B8', margin: '0 auto 14px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              No customers found
            </h3>
            <p style={{ color: '#64748B', fontSize: '13.5px', maxWidth: '380px', margin: '0 auto 18px' }}>
              {search
                ? `No customers match your search query "${search}".`
                : 'Get started by creating your first customer profile.'}
            </p>
            {!search && (isAdmin || isStaff) && (
              <button type="button" className="btn btn--primary" onClick={handleOpenCreate}>
                <Plus size={16} />
                <span>Add Customer</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="shared-data-table" aria-label="Customers list">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === customers.length && customers.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Select all customers"
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ width: '28%' }}>Customer</th>
                  <th style={{ width: '24%' }}>Contact Email</th>
                  <th style={{ width: '16%' }}>Phone</th>
                  <th style={{ width: '14%' }}>Location</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ width: '8%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="shared-data-table__row--clickable"
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={(e) => handleSelectOne(c.id, e)}
                        aria-label={`Select ${c.firstName} ${c.lastName}`}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#EEF2FF',
                            color: '#4F46E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(c.firstName, c.lastName)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '13.5px' }}>
                            {c.firstName} {c.lastName}
                          </span>
                          {c.companyName && (
                            <span
                              style={{
                                color: '#64748B',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Building2 size={12} />
                              <span>{c.companyName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#334155', fontSize: '13px' }}>{c.email}</span>
                    </td>
                    <td>
                      <span style={{ color: '#64748B', fontSize: '13px' }}>{c.phone || '—'}</span>
                    </td>
                    <td>
                      <span style={{ color: '#64748B', fontSize: '13px' }}>
                        {[c.city, c.country].filter(Boolean).join(', ') || '—'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Profile"
                          onClick={() => navigate(`/customers/${c.id}`)}
                        >
                          <Eye size={15} />
                        </button>
                        {(isAdmin || isStaff) && (
                          <>
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit Customer"
                              onClick={(e) => handleOpenEdit(c, e)}
                            >
                              <Edit2 size={15} />
                            </button>
                            {c.status !== 'INACTIVE' && (
                              <button
                                type="button"
                                className="btn-icon btn-icon--danger"
                                title="Deactivate Customer"
                                onClick={() => setDeletingCustomer(c)}
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
        {!isLoading && customers.length > 0 && (
          <div className="shared-data-table__pagination">
            <span>
              Showing {customers.length} of {total} customers
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

      {/* Customer Modal (Create / Edit) */}
      {isModalOpen && (
        <CustomerModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
          initialData={editingCustomer}
          isLoading={isSaving}
        />
      )}

      {/* Deactivate Confirm Modal */}
      {deletingCustomer && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-header__title">Deactivate Customer</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5 }}>
                Are you sure you want to deactivate{' '}
                <strong>
                  {deletingCustomer.firstName} {deletingCustomer.lastName}
                </strong>
                ?
              </p>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                Deactivating sets their status to Inactive. Existing historical invoices and subscription records remain preserved.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setDeletingCustomer(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deactivating...' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
