/**
 * Card.jsx
 * Standardized enterprise SaaS container card.
 * Provides consistent white surface, #E2E8F0 borders, and 12px radius.
 */

const Card = ({
  children,
  className = '',
  title = null,
  subtitle = null,
  action = null,
  padding = 'default',
  noBorder = false,
  ...rest
}) => {
  const paddingClass =
    padding === 'none' ? 'shared-card--no-padding' : padding === 'dense' ? 'shared-card--dense' : '';

  return (
    <div
      className={`shared-card ${paddingClass} ${noBorder ? 'shared-card--no-border' : ''} ${className}`}
      {...rest}
    >
      {(title || action) && (
        <div className="shared-card__header">
          <div>
            {title && <h3 className="shared-card__title">{title}</h3>}
            {subtitle && <p className="shared-card__subtitle">{subtitle}</p>}
          </div>
          {action && <div className="shared-card__header-action">{action}</div>}
        </div>
      )}
      <div className="shared-card__body">{children}</div>
    </div>
  );
};

export default Card;
