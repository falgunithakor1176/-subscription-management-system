/**
 * CustomersPage.jsx
 * Customer Management directory page matching SubManage design.
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
  ExternalLink,
  Eye,
  Filter,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import CustomerModal from '../components/CustomerModal.jsx';
import {
  createCustomerApi,
  deleteCustomerApi,
  getCustomersApi,
  updateCustomerApi,
} from '../services/customer.api.js';

const CustomersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        ...(search && { search }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      };
      const response = await getCustomersApi(params);
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
        setTotal(response.data.total || 0);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load customers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter]);

  // Handle Search submit / debounce
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
      setSuccessMessage(`Customer "${deletingCustomer.firstName} ${deletingCustomer.lastName}" marked inactive.`);
      setDeletingCustomer(null);
      await fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to deactivate customer.');
    } finally {
      setIsDeleting(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // Select all toggle
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

  const totalPages = Math.ceil(total / limit) || 1;

  // Initials generator
  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${f}${l}` || 'CU';
  };

  return (
    <div className="customers-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Customers</h1>
          <p className="page-header__subtitle">
            Manage your customer database, billing profiles, and contact details.
          </p>
        </div>

        <div className="page-header__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleOpenCreate}
            id="btn-add-customer"
          >
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="alert-banner alert-banner--success" style={{ marginBottom: '16px' }}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-banner--danger" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="table-toolbar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="input-with-icon" style={{ maxWidth: '340px' }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--secondary" style={{ padding: '8px 14px' }}>
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleClearSearch}
              style={{ padding: '8px 12px' }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <div className="filter-tabs">
            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-tab-pill ${statusFilter === st ? 'filter-tab-pill--active' : ''}`}
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
      <div className="table-card">
        {isLoading ? (
          <div className="table-loading-state">
            <Loader2 size={28} className="spin" />
            <span>Loading customers directory...</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="table-empty-state">
            <Users size={48} className="table-empty-state__icon" />
            <h3 className="table-empty-state__title">No customers found</h3>
            <p className="table-empty-state__text">
              {search
                ? `No customers match your search query "${search}".`
                : 'Get started by creating your first customer profile.'}
            </p>
            {!search && (
              <button type="button" className="btn btn--primary" onClick={handleOpenCreate}>
                <Plus size={16} />
                <span>Add Customer</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table" aria-label="Customers list">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === customers.length && customers.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Select all customers"
                    />
                  </th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="table-row-clickable"
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={(e) => handleSelectOne(c.id, e)}
                        aria-label={`Select ${c.firstName} ${c.lastName}`}
                      />
                    </td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {getInitials(c.firstName, c.lastName)}
                        </div>
                        <div className="customer-cell__meta">
                          <span className="customer-cell__name">
                            {c.firstName} {c.lastName}
                          </span>
                          {c.companyName && (
                            <span className="customer-cell__company">{c.companyName}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-with-icon">
                        <Mail size={14} className="cell-icon" />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td>
                      {c.phone ? (
                        <div className="cell-with-icon">
                          <Phone size={14} className="cell-icon" />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <span className="cell-text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className="cell-text-muted">
                        {[c.city, c.state].filter(Boolean).join(', ') || c.country || '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          c.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'
                        }`}
                      >
                        <span className="status-pill__dot" />
                        {c.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                      <div className="action-button-group" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="table-action-btn"
                          title="View Details"
                          onClick={() => navigate(`/customers/${c.id}`)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn"
                          title="Edit Customer"
                          onClick={(e) => handleOpenEdit(c, e)}
                        >
                          <Edit2 size={15} />
                        </button>
                        {c.status === 'ACTIVE' && (
                          <button
                            type="button"
                            className="table-action-btn table-action-btn--danger"
                            title="Deactivate Customer"
                            onClick={() => setDeletingCustomer(c)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && customers.length > 0 && (
          <div className="table-pagination">
            <span className="table-pagination__info">
              Showing <strong>{(page - 1) * limit + 1}</strong> to{' '}
              <strong>{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> customers
            </span>

            <div className="table-pagination__controls">
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <span className="pagination-page-indicator">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
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

      {/* Deactivate Confirm Dialog */}
      {deletingCustomer && (
        <div className="modal-backdrop" onClick={() => setDeletingCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-header__title">Deactivate Customer</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                Are you sure you want to deactivate{' '}
                <strong>
                  {deletingCustomer.firstName} {deletingCustomer.lastName}
                </strong>
                ? Existing subscriptions and invoices will be preserved, but the customer account will be set to Inactive.
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
                {isDeleting ? <Loader2 size={16} className="spin" /> : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
