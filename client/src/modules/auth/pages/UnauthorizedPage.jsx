/**
 * UnauthorizedPage.jsx
 * Enterprise 403 Forbidden / Access Denied view.
 * Displays when an authenticated user attempts to access a restricted role-based route.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-wrapper" aria-hidden="true">
          <ShieldAlert size={36} className="unauthorized-icon" />
        </div>

        <h1 className="unauthorized-title">Access Restricted</h1>

        <p className="unauthorized-description">
          You do not have the necessary permissions to access this section of the system.
          Your current account is assigned the <strong>{user?.role || 'User'}</strong> role.
        </p>

        <div className="unauthorized-details">
          <span>Required privileges: Administrative or Staff authorization.</span>
        </div>

        <div className="unauthorized-actions">
          <Link to="/dashboard" className="btn btn--primary">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
