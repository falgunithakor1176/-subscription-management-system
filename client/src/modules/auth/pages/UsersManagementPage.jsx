/**
 * UsersManagementPage.jsx
 * Admin-only User & Role Access Management Page.
 * Allows viewing all users, assigning roles (ADMIN, STAFF, CUSTOMER),
 * toggling user active/inactive status, and provisioning staff accounts.
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  Check, 
  Loader2, 
  Lock, 
  Plus, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  UserCheck, 
  UserX, 
  X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  createStaffApi, 
  getUsersApi, 
  updateUserRoleApi, 
  updateUserStatusApi 
} from '../services/auth.api.js';
import { useAuth } from '../hooks/useAuth.js';

const UsersManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // New staff form state
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

  // Load users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsersApi({
        page,
        limit: 15,
        ...(roleFilter && { role: roleFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      if (response.success) {
        setUsers(response.data);
        setTotal(response.pagination?.total || response.data.length);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle role update
  const handleRoleChange = async (userId, newRole) => {
    setActionLoadingId(userId);
    try {
      const response = await updateUserRoleApi(userId, newRole);
      if (response.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle active status toggle
  const handleStatusToggle = async (userId, currentStatus) => {
    setActionLoadingId(userId);
    const newStatus = !currentStatus;
    try {
      const response = await updateUserStatusApi(userId, newStatus);
      if (response.success) {
        toast.success(`User ${newStatus ? 'activated' : 'deactivated'}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u))
        );
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle create staff submission
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.firstName || !staffForm.lastName || !staffForm.email || !staffForm.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmittingStaff(true);
    try {
      const response = await createStaffApi({
        firstName: staffForm.firstName.trim(),
        lastName: staffForm.lastName.trim(),
        email: staffForm.email.trim().toLowerCase(),
        password: staffForm.password,
        ...(staffForm.phone.trim() && { phone: staffForm.phone.trim() }),
      });

      if (response.success) {
        toast.success('Staff account provisioned successfully.');
        setIsModalOpen(false);
        setStaffForm({ firstName: '', lastName: '', email: '', password: '', phone: '' });
        fetchUsers();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge--admin';
      case 'STAFF':
        return 'badge--staff';
      case 'CUSTOMER':
        return 'badge--customer';
      default:
        return '';
    }
  };

  return (
    <div className="users-page">
      {/* Page Header */}
      <div className="users-page__header">
        <div>
          <h1 className="users-page__title">Role & User Access Governance</h1>
          <p className="users-page__subtitle">
            Configure system authorization, manage role assignments, and provision staff accounts.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} aria-hidden="true" />
          <span>Provision Staff Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="users-controls">
        <div className="users-controls__search">
          <Search size={16} className="users-controls__search-icon" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="form-input users-controls__search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="users-controls__filter">
          <label htmlFor="role-filter" className="users-controls__filter-label">
            Role:
          </label>
          <select
            id="role-filter"
            className="form-input users-controls__filter-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STAFF">STAFF</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-card">
        {isLoading ? (
          <div className="users-loading">
            <Loader2 size={32} className="spin" aria-hidden="true" />
            <span>Loading user directory...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="users-empty">
            <UserX size={40} className="users-empty__icon" aria-hidden="true" />
            <h3 className="users-empty__title">No users found</h3>
            <p className="users-empty__text">
              No accounts match the current filter criteria.
            </p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role Assignment</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const isBusy = actionLoadingId === u.id;

                return (
                  <tr key={u.id} className={!u.isActive ? 'user-row--inactive' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" aria-hidden="true">
                          {u.firstName?.[0]}
                          {u.lastName?.[0]}
                        </div>
                        <div>
                          <div className="user-name">
                            {u.firstName} {u.lastName} {isSelf && <span className="user-you-tag">(You)</span>}
                          </div>
                          <div className="user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="user-role-cell">
                        <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                          {u.role}
                        </span>
                        {!isSelf && (
                          <select
                            className="role-select"
                            value={u.role}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            aria-label={`Change role for ${u.firstName} ${u.lastName}`}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="STAFF">STAFF</option>
                            <option value="CUSTOMER">CUSTOMER</option>
                          </select>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`status-pill ${u.isActive ? 'status-pill--active' : 'status-pill--inactive'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="user-date">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      {!isSelf && (
                        <button
                          type="button"
                          className={`btn-action ${u.isActive ? 'btn-action--deactivate' : 'btn-action--activate'}`}
                          disabled={isBusy}
                          onClick={() => handleStatusToggle(u.id, u.isActive)}
                          title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {isBusy ? (
                            <Loader2 size={14} className="spin" />
                          ) : u.isActive ? (
                            <>
                              <UserX size={14} aria-hidden="true" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck size={14} aria-hidden="true" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="users-table-footer">
          <span>Showing {users.length} of {total} registered users</span>
        </div>
      </div>

      {/* Provision Staff Modal */}
      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-header__title-box">
                <ShieldCheck size={22} className="modal-header__icon" aria-hidden="true" />
                <h2 id="modal-title" className="modal-header__title">Provision New Staff Member</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="staff-first-name">First name *</label>
                  <input
                    id="staff-first-name"
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Elena"
                    value={staffForm.firstName}
                    onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="staff-last-name">Last name *</label>
                  <input
                    id="staff-last-name"
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Vance"
                    value={staffForm.lastName}
                    onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="staff-email">Work Email *</label>
                <input
                  id="staff-email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="elena.vance@brightloop.com"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="staff-password">Initial Password *</label>
                <input
                  id="staff-password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="Min 8 chars with upper, lower & special"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="staff-phone">Contact Phone</label>
                <input
                  id="staff-phone"
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={isSubmittingStaff}
                >
                  {isSubmittingStaff ? (
                    <>
                      <Loader2 size={16} className="spin" aria-hidden="true" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <span>Create Staff Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;
