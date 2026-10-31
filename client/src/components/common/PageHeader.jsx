/**
 * PageHeader.jsx
 * Standardized page header component for all modules.
 * Renders consistent typography, breadcrumb metadata, and action button slots.
 */

import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions = null }) => {
  return (
    <div className="shared-page-header">
      <div className="shared-page-header__content">
        {breadcrumbs.length > 0 && (
          <nav className="shared-page-header__breadcrumbs" aria-label="Breadcrumb">
            <ol>
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                const target = crumb.to || crumb.path;
                return (
                  <li key={idx} className="breadcrumb-item">
                    {target && !isLast ? (
                      <Link to={target} className="breadcrumb-link">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={`breadcrumb-text ${isLast ? 'breadcrumb-text--current' : ''}`}>
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && <ChevronRight size={13} className="breadcrumb-sep" aria-hidden="true" />}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div className="shared-page-header__titles">
          <h1 className="shared-page-header__title">{title}</h1>
          {subtitle && <p className="shared-page-header__subtitle">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="shared-page-header__actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
