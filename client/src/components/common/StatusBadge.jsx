/**
 * StatusBadge.jsx
 * Reusable enterprise status pill component with indicator dot.
 */

const STATUS_CONFIGS = {
  ACTIVE: {
    label: 'Active',
    className: 'status-badge--active',
  },
  INACTIVE: {
    label: 'Inactive',
    className: 'status-badge--inactive',
  },
  SUSPENDED: {
    label: 'Suspended',
    className: 'status-badge--suspended',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'status-badge--inactive',
  },
  DRAFT: {
    label: 'Draft',
    className: 'status-badge--draft',
  },
};

const StatusBadge = ({ status, label: customLabel, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();
  const config = STATUS_CONFIGS[normalized] || {
    label: status || 'Unknown',
    className: 'status-badge--neutral',
  };

  const displayLabel = customLabel || config.label;

  return (
    <span className={`status-badge ${config.className} status-badge--${size}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      <span className="status-badge__label">{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
