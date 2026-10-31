/**
 * ProductModal.jsx
 * Modal dialog for Admin to create or edit products in SubManage.
 */

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Barcode,
  DollarSign,
  Layers,
  Loader2,
  Package,
  Plus,
  Tag,
  Trash2,
  X,
} from 'lucide-react';

const ProductModal = ({ isOpen, onClose, onSave, initialData = null, isLoading = false }) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    productType: 'SERVICE',
    salesPrice: '',
    costPrice: '',
    unit: 'Month',
    status: 'ACTIVE',
    description: '',
    variants: [],
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        productType: initialData.productType || 'SERVICE',
        salesPrice: initialData.salesPrice !== undefined ? initialData.salesPrice : '',
        costPrice: initialData.costPrice !== undefined && initialData.costPrice !== null ? initialData.costPrice : '',
        unit: initialData.unit || 'Month',
        status: initialData.status || 'ACTIVE',
        description: initialData.description || '',
        variants: initialData.variants || [],
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        productType: 'SERVICE',
        salesPrice: '',
        costPrice: '',
        unit: 'Month',
        status: 'ACTIVE',
        description: '',
        variants: [],
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required.';
    if (!formData.salesPrice || parseFloat(formData.salesPrice) <= 0) {
      errs.salesPrice = 'Sales price must be greater than 0.';
    }
    if (formData.costPrice && parseFloat(formData.costPrice) < 0) {
      errs.costPrice = 'Cost price cannot be negative.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  // Inline Variant Handlers (for new product creation)
  const handleAddInlineVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: '',
          sku: '',
          additionalPrice: 0,
          description: '',
          isActive: true,
        },
      ],
    }));
  };

  const handleInlineVariantChange = (index, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.variants];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, variants: copy };
    });
  };

  const handleRemoveInlineVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
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
        salesPrice: parseFloat(formData.salesPrice),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
      });
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save product.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content--wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-header__title">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="modal-header__subtitle">
              {isEditing
                ? 'Update pricing, product specifications, and settings.'
                : 'Configure a new product, billing type, and pricing variants.'}
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
            {/* General Info */}
            <div className="form-section-title">Product Details</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Product Name <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <Package className="input-icon" size={16} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                    placeholder="e.g. Cloud Infrastructure Platform"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sku">
                  SKU / Product Code
                </label>
                <div className="input-with-icon">
                  <Barcode className="input-icon" size={16} />
                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    className="form-input"
                    placeholder="e.g. PROD-CLOUD-01"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label" htmlFor="productType">
                  Product Type <span className="required-star">*</span>
                </label>
                <select
                  id="productType"
                  name="productType"
                  className="form-input form-select"
                  value={formData.productType}
                  onChange={handleChange}
                >
                  <option value="SERVICE">Service (SaaS / API)</option>
                  <option value="DIGITAL">Digital Goods</option>
                  <option value="PHYSICAL">Physical Product</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="unit">
                  Billing Unit
                </label>
                <input
                  id="unit"
                  name="unit"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Month, Seat, License"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-input form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="form-section-title" style={{ marginTop: '16px' }}>
              Pricing & Cost
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="salesPrice">
                  Sales Price ($) <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <DollarSign className="input-icon" size={16} />
                  <input
                    id="salesPrice"
                    name="salesPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`form-input ${errors.salesPrice ? 'form-input--error' : ''}`}
                    placeholder="0.00"
                    value={formData.salesPrice}
                    onChange={handleChange}
                  />
                </div>
                {errors.salesPrice && <span className="field-error">{errors.salesPrice}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="costPrice">
                  Cost Price ($) <span className="text-muted text-xs">(Internal / Margin calculation)</span>
                </label>
                <div className="input-with-icon">
                  <DollarSign className="input-icon" size={16} />
                  <input
                    id="costPrice"
                    name="costPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    className={`form-input ${errors.costPrice ? 'form-input--error' : ''}`}
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={handleChange}
                  />
                </div>
                {errors.costPrice && <span className="field-error">{errors.costPrice}</span>}
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginTop: '8px' }}>
              <label className="form-label" htmlFor="description">
                Description / Internal Notes
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                className="form-input form-textarea"
                placeholder="Product specs, features included, and SLA commitments..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Inline Variants (Creation Mode) */}
            {!isEditing && (
              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div className="form-section-title" style={{ margin: 0 }}>
                    Product Variants (Tiers / Surcharges)
                  </div>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={handleAddInlineVariant}
                  >
                    <Plus size={14} />
                    <span>Add Variant</span>
                  </button>
                </div>

                {formData.variants.length === 0 ? (
                  <p className="cell-text-muted" style={{ fontSize: '0.82rem' }}>
                    No variants added yet. You can add pricing tiers or attributes here or after creating the product.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.variants.map((v, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1.5fr 1fr 36px',
                          gap: '8px',
                          alignItems: 'center',
                          background: '#F8FAFC',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Variant Name (e.g. Pro Tier)"
                          value={v.name}
                          onChange={(e) => handleInlineVariantChange(idx, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Variant SKU"
                          value={v.sku}
                          onChange={(e) => handleInlineVariantChange(idx, 'sku', e.target.value)}
                        />
                        <div className="input-with-icon">
                          <DollarSign className="input-icon" size={14} />
                          <input
                            type="number"
                            step="0.01"
                            className="form-input"
                            placeholder="+Surcharge"
                            value={v.additionalPrice}
                            onChange={(e) =>
                              handleInlineVariantChange(idx, 'additionalPrice', e.target.value)
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className="table-action-btn table-action-btn--danger"
                          onClick={() => handleRemoveInlineVariant(idx)}
                          title="Remove variant"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
