/**
 * QuotationModal.jsx
 * Enterprise Modal for Creating and Editing Customer Quotations.
 * Restricted to STAFF & ADMIN roles.
 * Includes dynamic line items, product/variant pickers, discounts, and tax computation.
 */

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Loader2,
  Package,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { getCustomersApi } from '../../customers/services/customer.api.js';
import { getDemoCustomers } from '../../customers/services/demoCustomers.js';
import { getProductsApi } from '../../products/services/product.api.js';
import { getDemoProducts } from '../../products/services/demoProducts.js';

const QuotationModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    {
      productId: '',
      variantId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPct: 0,
      taxPct: 8,
    },
  ]);

  const [errors, setErrors] = useState({});

  // Load Customers and Products for dropdowns
  useEffect(() => {
    const loadData = async () => {
      try {
        const custRes = await getCustomersApi({ limit: 100, status: 'ACTIVE' });
        setCustomers(custRes?.data?.customers?.length ? custRes.data.customers : getDemoCustomers());
      } catch (e) {
        setCustomers(getDemoCustomers());
      }

      try {
        const prodRes = await getProductsApi({ limit: 100, status: 'ACTIVE' });
        setProducts(prodRes?.data?.products?.length ? prodRes.data.products : getDemoProducts());
      } catch (e) {
        setProducts(getDemoProducts());
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Sync form on open
  useEffect(() => {
    if (initialData) {
      setCustomerId(initialData.customerId || '');
      setValidityDate(initialData.validityDate ? initialData.validityDate.substring(0, 10) : '');
      setNotes(initialData.notes || '');
      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it) => ({
            productId: it.productId || '',
            variantId: it.variantId || '',
            description: it.description || '',
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || 0,
            discountPct: it.discountPct || 0,
            taxPct: it.taxPct !== undefined ? it.taxPct : 8,
          }))
        );
      }
    } else {
      setCustomerId('');
      setValidityDate('');
      setNotes('');
      setItems([
        {
          productId: '',
          variantId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          discountPct: 0,
          taxPct: 8,
        },
      ]);
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleProductChange = (index, prodId) => {
    const selectedProd = products.find((p) => p.id === prodId);
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: prodId,
        variantId: '',
        unitPrice: selectedProd ? parseFloat(selectedProd.salesPrice) : 0,
        description: selectedProd?.description || '',
      };
      return next;
    });
  };

  const handleVariantChange = (index, variantId) => {
    const item = items[index];
    const selectedProd = products.find((p) => p.id === item.productId);
    const selectedVariant = selectedProd?.variants?.find((v) => v.id === variantId);

    const basePrice = selectedProd ? parseFloat(selectedProd.salesPrice) : 0;
    const surcharge = selectedVariant ? parseFloat(selectedVariant.additionalPrice) || 0 : 0;

    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        variantId,
        unitPrice: basePrice + surcharge,
      };
      return next;
    });
  };

  const handleItemFieldChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        variantId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPct: 0,
        taxPct: 8,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Live calculation of totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const qty = parseInt(item.quantity, 10) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      const disc = parseFloat(item.discountPct) || 0;
      const tax = parseFloat(item.taxPct) || 0;

      const base = price * qty;
      const discAmt = base * (disc / 100);
      const afterDisc = base - discAmt;
      const taxAmt = afterDisc * (tax / 100);

      subtotal += base;
      totalDiscount += discAmt;
      totalTax += taxAmt;
    });

    const grandTotal = subtotal - totalDiscount + totalTax;
    return { subtotal, totalDiscount, totalTax, grandTotal };
  };

  const { subtotal, totalDiscount, totalTax, grandTotal } = calculateTotals();

  const validate = () => {
    const newErrors = {};

    if (!customerId) {
      newErrors.customerId = 'Please select a customer for this quotation.';
    }

    if (!items || items.length === 0) {
      newErrors.items = 'Quotation must have at least one line item.';
    } else {
      for (let i = 0; i < items.length; i++) {
        if (!items[i].productId) {
          newErrors.items = `Please select a product for line item #${i + 1}.`;
          break;
        }
        if (items[i].quantity < 1) {
          newErrors.items = `Quantity must be at least 1 for line item #${i + 1}.`;
          break;
        }
        if (items[i].unitPrice < 0) {
          newErrors.items = `Unit price cannot be negative for line item #${i + 1}.`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      customerId,
      validityDate: validityDate ? new Date(validityDate).toISOString() : null,
      notes,
      items: items.map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const variant = prod?.variants?.find((v) => v.id === it.variantId);
        return {
          productId: it.productId,
          productName: prod ? prod.name : 'Product',
          variantId: it.variantId || null,
          variantName: variant ? variant.name : null,
          description: it.description || '',
          quantity: parseInt(it.quantity, 10),
          unitPrice: parseFloat(it.unitPrice),
          discountPct: parseFloat(it.discountPct) || 0,
          taxPct: parseFloat(it.taxPct) || 0,
        };
      }),
    });
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="quote-modal-title">
      <div className="modal-content" style={{ maxWidth: '840px', width: '92%' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__info">
            <h2 id="quote-modal-title" className="modal-header__title">
              {isEditing ? 'Edit Quotation' : 'Create Customer Quotation'}
            </h2>
            <p className="modal-header__subtitle">
              Prepare line-item estimates, apply discounts and taxes, and submit quotes to clients.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh' }}>
            {errors.items && (
              <div className="alert alert--danger" style={{ marginBottom: '12px' }}>
                <AlertCircle size={15} />
                <span>{errors.items}</span>
              </div>
            )}

            {/* General Info */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="quote-customer">
                  Select Customer <span className="form-label__required">*</span>
                </label>
                <select
                  id="quote-customer"
                  className={`form-select ${errors.customerId ? 'form-input--error' : ''}`}
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    if (errors.customerId) setErrors((prev) => ({ ...prev, customerId: null }));
                  }}
                  disabled={isEditing}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} {c.companyName ? `(${c.companyName})` : ''} — {c.email}
                    </option>
                  ))}
                </select>
                {errors.customerId && <span className="form-error">{errors.customerId}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quote-validity">
                  Validity Expiration Date
                </label>
                <input
                  id="quote-validity"
                  type="date"
                  className="form-input"
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  paddingBottom: '6px',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Line Items ({items.length})
                </span>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={handleAddItem}
                >
                  <Plus size={14} />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map((item, idx) => {
                  const selectedProd = products.find((p) => p.id === item.productId);
                  const availableVariants = selectedProd?.variants || [];
                  const lineTotal =
                    (item.unitPrice * item.quantity * (1 - item.discountPct / 100)) *
                    (1 + item.taxPct / 100);

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px, 2fr) minmax(150px, 1.5fr) 80px 100px 70px 70px 40px',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                      >
                        {/* Product Picker */}
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Product
                          </label>
                          <select
                            className="form-select"
                            style={{ height: '34px', fontSize: '12.5px' }}
                            value={item.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                          >
                            <option value="">-- Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Variant Picker */}
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Variant (Optional)
                          </label>
                          <select
                            className="form-select"
                            style={{ height: '34px', fontSize: '12.5px' }}
                            value={item.variantId}
                            onChange={(e) => handleVariantChange(idx, e.target.value)}
                            disabled={!availableVariants.length}
                          >
                            <option value="">Base / None</option>
                            {availableVariants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} (+${v.additionalPrice || 0})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="form-input"
                            style={{ height: '34px', fontSize: '12.5px' }}
                            value={item.quantity}
                            onChange={(e) => handleItemFieldChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                          />
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-input"
                            style={{ height: '34px', fontSize: '12.5px' }}
                            value={item.unitPrice}
                            onChange={(e) => handleItemFieldChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        {/* Disc % */}
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Disc %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-input"
                            style={{ height: '34px', fontSize: '12.5px' }}
                            value={item.discountPct}
                            onChange={(e) => handleItemFieldChange(idx, 'discountPct', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        {/* Tax % */}
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block' }}>
                            Tax %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="form-input"
                            style={{ height: '34px', fontSize: '12.5px' }}
                            value={item.taxPct}
                            onChange={(e) => handleItemFieldChange(idx, 'taxPct', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        {/* Delete Row */}
                        <div style={{ paddingTop: '16px' }}>
                          <button
                            type="button"
                            className="btn-icon btn-icon--danger"
                            style={{ height: '34px', width: '34px' }}
                            disabled={items.length <= 1}
                            onClick={() => handleRemoveItem(idx)}
                            title="Remove line item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Optional line notes (e.g., custom configuration details)..."
                          style={{ height: '28px', fontSize: '11.5px', maxWidth: '70%' }}
                          value={item.description}
                          onChange={(e) => handleItemFieldChange(idx, 'description', e.target.value)}
                        />
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          Line Total: {formatCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes & Summary Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '16px',
                marginTop: '12px',
                alignItems: 'start',
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="quote-notes">
                  Quotation Notes / Terms
                </label>
                <textarea
                  id="quote-notes"
                  rows={4}
                  className="form-textarea"
                  placeholder="Terms of service, delivery schedule, SLA commitment, or payment requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Real-time Financial Breakdown */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16A34A' }}>
                  <span>Discounts Applied</span>
                  <span style={{ fontWeight: 600 }}>-{formatCurrency(totalDiscount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748B' }}>
                  <span>Estimated Taxes</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>+{formatCurrency(totalTax)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0F172A',
                    paddingTop: '8px',
                    borderTop: '1px solid #E2E8F0',
                  }}
                >
                  <span>Grand Total</span>
                  <span style={{ color: '#4F46E5' }}>{formatCurrency(grandTotal)}</span>
                </div>
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
                  <Loader2 size={15} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Save as Draft'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationModal;
