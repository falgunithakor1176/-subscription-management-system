/**
 * ProfilePage.jsx
 * Authenticated user profile and security governance page.
 * Displays user identity, role permissions breakdown, and change password form.
 */

import { useState } from 'react';
import { 
  Check, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Loader2, 
  Lock, 
  Mail, 
  Phone, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.js';
import { changePasswordApi } from '../services/auth.api.js';

const PASSWORD_RULES = [
  { id: 'len', label: 'Minimum 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'At least one uppercase letter (A-Z)', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'At least one lowercase letter (a-z)', test: (v) => /[a-z]/.test(v) },
  { id: 'special', label: 'At least one special character (!@#$%^&*)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const ROLE_DESCRIPTIONS = {
  ADMIN: {
    title: 'Administrator',
    level: 'Full Administrative Privileges',
    badgeClass: 'badge--admin',
    capabilities: [
      'Full administrative access across all system settings',
      'Authority to provision and manage internal Staff accounts',
      'Authority to configure and modify user roles (Admin, Staff, Customer)',
      'Account lifecycle governance (activate and deactivate user accounts)',
      'Protection against accidental demotion of the last active administrator',
    ],
    restrictions: [
      'Cannot deactivate or demote own administrator account while sole administrator',
    ],
  },
  STAFF: {
    title: 'Staff Member',
    level: 'Operational Privileges',
    badgeClass: 'badge--staff',
    capabilities: [
      'Access to operational workspace workflows',
      'Self-service password and profile management',
    ],
    restrictions: [
      'Cannot provision other Staff or Administrator accounts',
      'Cannot access or modify user roles or permissions',
      'Restricted from administrative governance endpoints',
    ],
  },
  CUSTOMER: {
    title: 'Customer',
    level: 'Self-Service Portal Access',
    badgeClass: 'badge--customer',
    capabilities: [
      'Access to customer self-service portal workspace',
      'Strict customer-level data isolation',
      'Self-service password and profile management',
    ],
    restrictions: [
      'Cannot access internal administrative or staff workspaces',
      'Cannot access records or information belonging to other customers',
      'Restricted from administrative API endpoints',
    ],
  },
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleInfo = ROLE_DESCRIPTIONS[user?.role] || ROLE_DESCRIPTIONS.CUSTOMER;

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwords.currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    const failedRules = PASSWORD_RULES.filter((r) => !r.test(passwords.newPassword));
    if (failedRules.length > 0) {
      toast.error('New password does not meet complexity requirements.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await changePasswordApi(passwords);
      if (response.success) {
        toast.success('Password updated successfully.');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="profile-page__header">
        <h1 className="profile-page__title">Account & Security Profile</h1>
        <p className="profile-page__subtitle">
          Manage your personal credentials and review your assigned role permissions.
        </p>
      </div>

      <div className="profile-grid">
        {/* Left Column: Profile Card + RBAC Permissions */}
        <div className="profile-col">
          {/* Identity Card */}
          <div className="profile-card">
            <div className="profile-card__header">
              <div className="profile-avatar-large" aria-hidden="true">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div>
                <h2 className="profile-card__name">
                  {user?.firstName} {user?.lastName}
                </h2>
                <div className="profile-card__meta">
                  <span className={`badge ${roleInfo.badgeClass}`}>
                    {user?.role}
                  </span>
                  <span className="status-pill status-pill--active">
                    Active Account
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <Mail size={16} className="profile-info-icon" aria-hidden="true" />
                <div className="profile-info-content">
                  <span className="profile-info-label">Email Address</span>
                  <span className="profile-info-value">{user?.email}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <Phone size={16} className="profile-info-icon" aria-hidden="true" />
                <div className="profile-info-content">
                  <span className="profile-info-label">Phone Number</span>
                  <span className="profile-info-value">{user?.phone || 'Not configured'}</span>
                </div>
              </div>

              <div className="profile-info-item">
                <Shield size={16} className="profile-info-icon" aria-hidden="true" />
                <div className="profile-info-content">
                  <span className="profile-info-label">Access Level</span>
                  <span className="profile-info-value">{roleInfo.level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RBAC Breakdown Card */}
          <div className="profile-card">
            <div className="profile-card__title-row">
              <ShieldCheck size={20} className="text-primary" aria-hidden="true" />
              <h3 className="profile-card__heading">Role Permissions Breakdown</h3>
            </div>

            <p className="profile-card__lead">
              Your account operates under the <strong>{roleInfo.title}</strong> security profile:
            </p>

            <div className="profile-rbac-section">
              <span className="profile-rbac-label">Granted Capabilities:</span>
              <ul className="profile-rbac-list">
                {roleInfo.capabilities.map((cap, idx) => (
                  <li key={idx} className="profile-rbac-item profile-rbac-item--granted">
                    <Check size={14} className="profile-rbac-icon" aria-hidden="true" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="profile-rbac-section">
              <span className="profile-rbac-label">Role Boundaries & Restrictions:</span>
              <ul className="profile-rbac-list">
                {roleInfo.restrictions.map((res, idx) => (
                  <li key={idx} className="profile-rbac-item profile-rbac-item--restricted">
                    <X size={14} className="profile-rbac-icon" aria-hidden="true" />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password Card */}
        <div className="profile-col">
          <div className="profile-card">
            <div className="profile-card__title-row">
              <KeyRound size={20} className="text-primary" aria-hidden="true" />
              <h3 className="profile-card__heading">Change Password</h3>
            </div>

            <p className="profile-card__lead">
              Ensure your account is protected with a strong, distinct password.
            </p>

            <form onSubmit={handlePasswordChange} className="auth-form">
              {/* Current Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-current-pass">
                  Current Password
                </label>
                <div className="form-input-box">
                  <Lock size={18} className="form-input-icon form-input-icon--lead" aria-hidden="true" />
                  <input
                    id="profile-current-pass"
                    type={showCurrent ? 'text' : 'password'}
                    required
                    className="form-input form-input--has-lead form-input--has-trail"
                    placeholder="Enter current password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="form-input-icon-btn"
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-new-pass">
                  New Password
                </label>
                <div className="form-input-box">
                  <Lock size={18} className="form-input-icon form-input-icon--lead" aria-hidden="true" />
                  <input
                    id="profile-new-pass"
                    type={showNew ? 'text' : 'password'}
                    required
                    className="form-input form-input--has-lead form-input--has-trail"
                    placeholder="Create strong new password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="form-input-icon-btn"
                    onClick={() => setShowNew(!showNew)}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password rule indicators */}
                {passwords.newPassword.length > 0 && (
                  <ul className="password-rules" aria-label="Password rules">
                    {PASSWORD_RULES.map((r) => {
                      const met = r.test(passwords.newPassword);
                      return (
                        <li key={r.id} className={`password-rules__item ${met ? 'password-rules__item--met' : 'password-rules__item--unmet'}`}>
                          {met ? <Check size={12} /> : <X size={12} />}
                          <span>{r.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-confirm-pass">
                  Confirm New Password
                </label>
                <div className="form-input-box">
                  <Lock size={18} className="form-input-icon form-input-icon--lead" aria-hidden="true" />
                  <input
                    id="profile-confirm-pass"
                    type={showNew ? 'text' : 'password'}
                    required
                    className="form-input form-input--has-lead"
                    placeholder="Repeat new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full btn--lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spin" aria-hidden="true" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
