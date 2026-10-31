/**
 * PlanModal.jsx
 * Enterprise Modal for Creating and Editing Subscription Plans.
 * Restricted to ADMIN role. Enforces proper validations (price > 0, minQuantity >= 1, dates).
 */

import { useEffect, useState } from 'react';
import { AlertCircle, Calendar, DollarSign, Layers, Loader2, X } from 'lucide-react';
import { getDemoProducts } from '../../products/services/demoProducts.js';
import { getProductsApi } from '../../products/services/product.api.js';

const PlanModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
    price: '',
    billingFrequency: 'MONTHLY',
    minQuantity: 1,
    startDate: '',
    endDate: '',
    autoClose: false,
    status: 'ACTIVE',
  });

  const [productsList, setProductsList] = useState([]);
  const [errors, setErrors] = useState({});

  // Load available products for the dropdown
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await getProductsApi({ limit: 100, status: 'ACTIVE' });
        if (res?.data?.products?.length > 0) {
          setProductsList(res.data.products);
        } else {
          setProductsList(getDemoProducts());
        }
      } catch (e) {
        setProductsList(getDemoProducts());
      }
    };
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // Sync form data on open/edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        productId: initialData.productId || '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        billingFrequency: initialData.billingFrequency || 'MONTHLY',
        minQuantity: initialData.minQuantity || 1,
        startDate: initialData.startDate ? initialData.startDate.substring(0, 10) : '',
        endDate: initialData.endDate ? initialData.endDate.substring(0, 10) : '',
        autoClose: Boolean(initialData.autoClose),
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        productId: '',
        price: '',
        billingFrequency: 'MONTHLY',
        minQuantity: 1,
        startDate: '',
        endDate: '',
        autoClose: false,
        status: 'ACTIVE',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Plan name must be at least 2 characters.';
    }

    if (!formData.productId) {
      newErrors.productId = 'Please select an associated product.';
    }

    const numPrice = parseFloat(formData.price);
    if (!formData.price || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Price must be a positive number greater than 0.';
    }

    const minQty = parseInt(formData.minQuantity, 10);
    if (isNaN(minQty) || minQty < 1) {
      newErrors.minQuantity = 'Minimum quantity must be at least 1.';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after the start date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      price: parseFloat(formData.price),
      minQuantity: parseInt(formData.minQuantity, 10),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__info">
            <h2 id="plan-modal-title" className="modal-header__title">
              {isEditing ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h2>
            <p className="modal-header__subtitle">
              {isEditing
                ? 'Update billing frequency, pricing tiers, and validity rules.'
                : 'Define a recurring billing plan tied to an active product catalog item.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-header__close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* General Information */}
            <div className="form-section">
              <span className="form-section__title">General Information</span>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" htmlFor="plan-name">
                  Plan Name <span className="form-label__required">*</span>
                </label>
                <input
                  id="plan-name"
                  name="name"
                  type="text"
                  className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                  placeholder="e.g. Cloud Pro Monthly, Annual Enterprise"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                {/* Product Dropdown */}
                <div className="form-group">
                  <label className="form-label" htmlFor="plan-productId">
                    Associated Product <span className="form-label__required">*</span>
                  </label>
                  <select
                    id="plan-productId"
                    name="productId"
                    className={`form-select ${errors.productId ? 'form-input--error' : ''}`}
                    value={formData.productId}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Product --</option>
                    {productsList.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.productType || 'SERVICE'})
                      </option>
                    ))}
                  </select>
                  {errors.productId && <span className="form-error">{errors.productId}</span>}
                </div>

                {/* Status */}
                <div className="form-group">
                  <label className="form-label" htmlFor="plan-status">
                    Plan Status
                  </label>
                  <select
                    id="plan-status"
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">ACTIVE (Published)</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" htmlFor="plan-description">
                  Description
                </label>
                <textarea
                  id="plan-description"
                  name="description"
                  rows={2}
                  className="form-textarea"
                  placeholder="Summary of plan benefits, compute limits, or renewal terms..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Pricing & Billing Cycle */}
            <div className="form-section">
              <span className="form-section__title">Pricing & Billing Cycle</span>

              <div className="form-grid-3" style={{ marginBottom: '14px' }}>
                {/* Price */}
                <div className="form-group">
                  <label className="form-label" htmlFor="plan-price">
                    Recurring Price ($) <span className="form-label__required">*</span>
                  </label>
                  <input
                    id="plan-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`form-input ${errors.price ? 'form-input--error' : ''}`}
                    placeholder="299.00"
                    value={formData.price}
                    onChange={handleChange}
                  />
                  {errors.price && <span className="form-error">{errors.price}</span>}
                </div>

                {/* Billing Frequency */}
                <div className="form-group">
                  <label className="form-label" htmlFor="plan-frequency">
                    Billing Cycle
                  </label>
                  <select
                    id="plan-frequency"
                    name="billingFrequency"
                    className="form-select"
                    value={formData.billingFrequency}
                    onChange={handleChange}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                {/* Min Quantity */}
                <div className="form-group">
                  <label className="form-label" htmlFor="plan-minQuantity">
                    Min Quantity
                  </label>
                  <input
                    id="plan-minQuantity"
                    name="minQuantity"
                    type="number"
                    min="1"
                    className={`form-input ${errors.minQuantity ? 'form-input--error' : ''}`}
                    placeholder="1"
                    value={formData.minQuantity}
                    onChange={handleChange}
                  />
                  {errors.minQuantity && <span className="form-error">{errors.minQuantity}</span>}
                </div>
              </div>
            </div>

            {/* Validity & Auto-Close Rules */}
            <div className="form-section">
              <span className="form-section__title">Validity & Auto-Close Rules</span>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="plan-startDate">
                    Start Date (Optional)
                  </label>
                  <input
                    id="plan-startDate"
                    name="startDate"
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="plan-endDate">
                    End Date (Optional)
                  </label>
                  <input
                    id="plan-endDate"
                    name="endDate"
                    type="date"
                    className={`form-input ${errors.endDate ? 'form-input--error' : ''}`}
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                  {errors.endDate && <span className="form-error">{errors.endDate}</span>}
                </div>
              </div>

              {/* Auto Close Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  id="plan-autoClose"
                  name="autoClose"
                  type="checkbox"
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  checked={formData.autoClose}
                  onChange={handleChange}
                />
                <label htmlFor="plan-autoClose" style={{ fontSize: '13px', color: '#0F172A', cursor: 'pointer' }}>
                  <strong>Auto-Close:</strong> Automatically close subscriptions on this plan when the end date is reached.
                </label>
              </div>
            </div>
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
                <span>{isEditing ? 'Save Changes' : 'Create Plan'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
