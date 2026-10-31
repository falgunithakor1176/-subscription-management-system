/**
 * CustomerModal.jsx
 * Modal dialog for creating and editing customer profiles in SubManage.
 */

import { useEffect, useState } from 'react';
import { AlertCircle, Building2, Globe, Loader2, Mail, MapPin, Phone, User, X } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, onSave, initialData = null, isLoading = false }) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    postalCode: '',
    notes: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        companyName: initialData.companyName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || 'United States',
        postalCode: initialData.postalCode || '',
        notes: initialData.notes || '',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'United States',
        postalCode: '',
        notes: '',
        status: 'ACTIVE',
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save customer. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content--wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-header__title">
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <p className="modal-header__subtitle">
              {isEditing
                ? 'Update customer details and billing information.'
                : 'Create a new customer profile for subscriptions and billing.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div className="alert-banner alert-banner--danger" style={{ margin: '0 24px 16px' }}>
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Identity Group */}
            <div className="form-section-title">Personal & Company Information</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">
                  First Name <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <User className="input-icon" size={16} />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={`form-input ${errors.firstName ? 'form-input--error' : ''}`}
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="lastName">
                  Last Name <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <User className="input-icon" size={16} />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={`form-input ${errors.lastName ? 'form-input--error' : ''}`}
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={16} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number
                </label>
                <div className="input-with-icon">
                  <Phone className="input-icon" size={16} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="companyName">
                  Company / Organization
                </label>
                <div className="input-with-icon">
                  <Building2 className="input-icon" size={16} />
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Corp"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Account Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-input form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {/* Address Group */}
            <div className="form-section-title" style={{ marginTop: '16px' }}>
              Billing & Physical Address
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Street Address
              </label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={16} />
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 100 Main St, Suite 400"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="form-input"
                  placeholder="e.g. San Francisco"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="state">
                  State / Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  className="form-input"
                  placeholder="e.g. CA"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="postalCode">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 94105"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="country">
                Country
              </label>
              <div className="input-with-icon">
                <Globe className="input-icon" size={16} />
                <input
                  id="country"
                  name="country"
                  type="text"
                  className="form-input"
                  placeholder="e.g. United States"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Notes Group */}
            <div className="form-group" style={{ marginTop: '8px' }}>
              <label className="form-label" htmlFor="notes">
                Internal Account Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="form-input form-textarea"
                placeholder="Add special terms, payment preferences, or customer notes..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Customer'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
