/**
 * VariantModal.jsx
 * Modal dialog for Admin to add or edit an individual product variant.
 */

import { useEffect, useState } from 'react';
import { AlertCircle, Barcode, DollarSign, Layers, Loader2, X } from 'lucide-react';

const VariantModal = ({ isOpen, onClose, onSave, initialData = null, isLoading = false }) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    additionalPrice: '0',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        additionalPrice: initialData.additionalPrice !== undefined ? initialData.additionalPrice : '0',
        description: initialData.description || '',
        isActive: initialData.isActive !== false,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        additionalPrice: '0',
        description: '',
        isActive: true,
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Variant name is required.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    try {
      await onSave({
        ...formData,
        additionalPrice: parseFloat(formData.additionalPrice) || 0,
      });
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save variant.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-header__title">
              {isEditing ? 'Edit Variant' : 'Add Product Variant'}
            </h3>
            <p className="modal-header__subtitle">
              Configure variant tier, surcharge, or SKU attribute.
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {serverError && (
          <div className="alert-banner alert-banner--danger" style={{ margin: '0 24px 16px' }}>
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="variant-name">
                Variant Name <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <Layers className="input-icon" size={16} />
                <input
                  id="variant-name"
                  name="name"
                  type="text"
                  className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                  placeholder="e.g. Enterprise Tier (16 vCPU)"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="variant-sku">
                  Variant SKU
                </label>
                <div className="input-with-icon">
                  <Barcode className="input-icon" size={16} />
                  <input
                    id="variant-sku"
                    name="sku"
                    type="text"
                    className="form-input"
                    placeholder="e.g. VAR-ENT-16"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="additionalPrice">
                  Additional Surcharge ($)
                </label>
                <div className="input-with-icon">
                  <DollarSign className="input-icon" size={16} />
                  <input
                    id="additionalPrice"
                    name="additionalPrice"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={formData.additionalPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="variant-desc">
                Description
              </label>
              <textarea
                id="variant-desc"
                name="description"
                rows={2}
                className="form-input form-textarea"
                placeholder="Variant details or specifications..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label htmlFor="isActive" style={{ fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>
                Variant is active and available for selection
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Add Variant'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VariantModal;
