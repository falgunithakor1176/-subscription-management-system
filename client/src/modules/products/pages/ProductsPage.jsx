/**
 * ProductsPage.jsx
 * Product & Variant Management catalog page in SubManage.
 * Features search, type & status filters, expandable variants accordion,
 * Admin creation/edit modals, and role-based action controls.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Barcode,
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Edit2,
  Eye,
  Layers,
  Loader2,
  Package,
  Plus,
  Search,
  Server,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import ProductModal from '../components/ProductModal.jsx';
import VariantModal from '../components/VariantModal.jsx';
import {
  createProductApi,
  createVariantApi,
  deleteProductApi,
  deleteVariantApi,
  getProductsApi,
  updateProductApi,
  updateVariantApi,
} from '../services/product.api.js';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Expandable row state (Set of product IDs)
  const [expandedProductIds, setExpandedProductIds] = useState(new Set());

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Variant Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [activeProductIdForVariant, setActiveProductIdForVariant] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  // Archive Confirm State
  const [archivingProduct, setArchivingProduct] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        ...(search && { search }),
        ...(typeFilter !== 'ALL' && { productType: typeFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      };
      const response = await getProductsApi(params);
      if (response.success && response.data) {
        setProducts(response.data.products || []);
        setTotal(response.data.total || 0);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Product Actions
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product, e) => {
    e.stopPropagation();
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    setIsSavingProduct(true);
    try {
      if (editingProduct) {
        await updateProductApi(editingProduct.id, formData);
        setSuccessMessage(`Product "${formData.name}" updated successfully.`);
      } else {
        await createProductApi(formData);
        setSuccessMessage(`Product "${formData.name}" created successfully.`);
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } finally {
      setIsSavingProduct(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingProduct) return;
    setIsArchiving(true);
    try {
      await deleteProductApi(archivingProduct.id);
      setSuccessMessage(`Product "${archivingProduct.name}" archived.`);
      setArchivingProduct(null);
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to archive product.');
    } finally {
      setIsArchiving(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  // Variant Actions
  const handleOpenAddVariant = (product, e) => {
    e.stopPropagation();
    setActiveProductIdForVariant(product.id);
    setEditingVariant(null);
    setIsVariantModalOpen(true);
  };

  const handleOpenEditVariant = (productId, variant, e) => {
    e.stopPropagation();
    setActiveProductIdForVariant(productId);
    setEditingVariant(variant);
    setIsVariantModalOpen(true);
  };

  const handleSaveVariant = async (variantData) => {
    setIsSavingVariant(true);
    try {
      if (editingVariant) {
        await updateVariantApi(activeProductIdForVariant, editingVariant.id, variantData);
        setSuccessMessage(`Variant "${variantData.name}" updated.`);
      } else {
        await createVariantApi(activeProductIdForVariant, variantData);
        setSuccessMessage(`Variant "${variantData.name}" added.`);
        // Auto expand to show new variant
        setExpandedProductIds((prev) => new Set(prev).add(activeProductIdForVariant));
      }
      setIsVariantModalOpen(false);
      setEditingVariant(null);
      await fetchProducts();
    } finally {
      setIsSavingVariant(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleDeleteVariant = async (productId, variantId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this variant?')) return;
    try {
      await deleteVariantApi(productId, variantId);
      setSuccessMessage('Variant removed.');
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to remove variant.');
    } finally {
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const formatPrice = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SERVICE':
        return <Server size={15} className="cell-icon" />;
      case 'DIGITAL':
        return <Smartphone size={15} className="cell-icon" />;
      case 'PHYSICAL':
        return <Package size={15} className="cell-icon" />;
      default:
        return <Layers size={15} className="cell-icon" />;
    }
  };

  return (
    <div className="shared-page-container">
      {/* Standard PageHeader */}
      <PageHeader
        title="Products & Variants"
        subtitle="Manage product catalog, base sales pricing, cost margins, and variant surcharges."
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Products' },
        ]}
        actions={
          isAdmin && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleOpenCreateProduct}
              id="btn-add-product"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          )
        }
      />

      {/* Notifications */}
      {successMessage && (
        <div className="alert-banner alert-banner--success" style={{ marginBottom: '16px' }}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-banner--danger" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar & Filter Bar */}
      <div className="table-toolbar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="input-with-icon" style={{ maxWidth: '340px' }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search products or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--secondary" style={{ padding: '8px 14px' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Type Filter */}
          <div className="filter-group">
            <span className="filter-label">Type:</span>
            <div className="filter-tabs">
              {['ALL', 'SERVICE', 'DIGITAL', 'PHYSICAL'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`filter-tab-pill ${typeFilter === t ? 'filter-tab-pill--active' : ''}`}
                  onClick={() => {
                    setTypeFilter(t);
                    setPage(1);
                  }}
                >
                  {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter (Admin & Staff) */}
          {!isCustomer && (
            <div className="filter-group">
              <span className="filter-label">Status:</span>
              <div className="filter-tabs">
                {['ACTIVE', 'ARCHIVED', 'ALL'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`filter-tab-pill ${statusFilter === s ? 'filter-tab-pill--active' : ''}`}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                  >
                    {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="table-card">
        {isLoading ? (
          <div className="table-loading-state">
            <Loader2 size={28} className="spin" />
            <span>Loading product catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="table-empty-state">
            <Package size={48} className="table-empty-state__icon" />
            <h3 className="table-empty-state__title">No products found</h3>
            <p className="table-empty-state__text">
              {search ? `No products match "${search}".` : 'No products available in the catalog.'}
            </p>
            {isAdmin && !search && (
              <button type="button" className="btn btn--primary" onClick={handleOpenCreateProduct}>
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table" aria-label="Product list">
              <thead>
                <tr>
                  <th style={{ width: '36px' }} />
                  <th>Product</th>
                  <th>Type</th>
                  <th>Sales Price</th>
                  {!isCustomer && <th>Cost Price</th>}
                  <th>Variants</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isExpanded = expandedProductIds.has(p.id);
                  const variants = p.variants || [];

                  return (
                    <tr key={p.id} className="table-row-group">
                      <td colSpan={isCustomer ? 7 : 8} style={{ padding: 0, border: 'none' }}>
                        <div
                          className="table-row-clickable"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isCustomer
                              ? '36px 2.2fr 1.2fr 1.2fr 1.2fr 1fr 100px'
                              : '36px 2.2fr 1.2fr 1.2fr 1.2fr 1.2fr 1fr 120px',
                            padding: '1rem 1.25rem',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--color-border)',
                          }}
                          onClick={() => navigate(`/products/${p.id}`)}
                        >
                          {/* Expand chevron */}
                          <div
                            onClick={(e) => toggleExpand(p.id, e)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title={variants.length > 0 ? 'Toggle variants' : 'No variants'}
                          >
                            {variants.length > 0 ? (
                              isExpanded ? (
                                <ChevronDown size={18} color="#6366F1" />
                              ) : (
                                <ChevronRight size={18} color="#94A3B8" />
                              )
                            ) : (
                              <span style={{ width: 18 }} />
                            )}
                          </div>

                          {/* Product cell */}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{p.name}</span>
                            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                              {p.sku || 'No SKU'} {p.unit ? `• /${p.unit}` : ''}
                            </span>
                          </div>

                          {/* Type */}
                          <div className="cell-with-icon">
                            {getTypeIcon(p.productType)}
                            <span style={{ fontSize: '0.84rem' }}>
                              {p.productType.charAt(0) + p.productType.slice(1).toLowerCase()}
                            </span>
                          </div>

                          {/* Sales Price */}
                          <div>
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>
                              {formatPrice(p.salesPrice)}
                            </span>
                          </div>

                          {/* Cost Price (Internal) */}
                          {!isCustomer && (
                            <div>
                              <span className="cell-text-muted">
                                {p.costPrice ? formatPrice(p.costPrice) : '—'}
                              </span>
                            </div>
                          )}

                          {/* Variants count pill */}
                          <div>
                            <button
                              type="button"
                              className="contact-tag"
                              style={{
                                cursor: 'pointer',
                                background: variants.length > 0 ? '#EEF2FF' : '#F1F5F9',
                                color: variants.length > 0 ? '#4F46E5' : '#64748B',
                                border: 'none',
                                fontWeight: 600,
                              }}
                              onClick={(e) => toggleExpand(p.id, e)}
                            >
                              <Layers size={13} />
                              <span>{variants.length} {variants.length === 1 ? 'Variant' : 'Variants'}</span>
                            </button>
                          </div>

                          {/* Status */}
                          <div>
                            <span
                              className={`status-pill ${
                                p.status === 'ACTIVE'
                                  ? 'status-pill--active'
                                  : 'status-pill--inactive'
                              }`}
                            >
                              <span className="status-pill__dot" />
                              {p.status === 'ACTIVE' ? 'Active' : 'Archived'}
                            </span>
                          </div>

                          {/* Actions */}
                          <div style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div className="action-button-group">
                              <button
                                type="button"
                                className="table-action-btn"
                                title="View Product Details"
                                onClick={() => navigate(`/products/${p.id}`)}
                              >
                                <Eye size={15} />
                              </button>

                              {isAdmin && (
                                <>
                                  <button
                                    type="button"
                                    className="table-action-btn"
                                    title="Add Variant"
                                    onClick={(e) => handleOpenAddVariant(p, e)}
                                  >
                                    <Plus size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    className="table-action-btn"
                                    title="Edit Product"
                                    onClick={(e) => handleOpenEditProduct(p, e)}
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  {p.status === 'ACTIVE' && (
                                    <button
                                      type="button"
                                      className="table-action-btn table-action-btn--danger"
                                      title="Archive Product"
                                      onClick={() => setArchivingProduct(p)}
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Accordion: Variants Table */}
                        {isExpanded && (
                          <div
                            style={{
                              background: '#F8FAFC',
                              padding: '12px 24px 16px 56px',
                              borderBottom: '1px solid #E2E8F0',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  color: '#64748B',
                                }}
                              >
                                Configured Variants for {p.name}
                              </span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  className="btn btn--secondary btn--sm"
                                  onClick={(e) => handleOpenAddVariant(p, e)}
                                >
                                  <Plus size={13} />
                                  <span>Add Variant</span>
                                </button>
                              )}
                            </div>

                            {variants.length === 0 ? (
                              <p className="cell-text-muted" style={{ fontSize: '0.82rem' }}>
                                No variants configured yet.
                              </p>
                            ) : (
                              <div
                                style={{
                                  background: '#FFFFFF',
                                  borderRadius: '8px',
                                  border: '1px solid #E2E8F0',
                                  overflow: 'hidden',
                                }}
                              >
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'left' }}>
                                        Variant Name
                                      </th>
                                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'left' }}>
                                        SKU
                                      </th>
                                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'left' }}>
                                        Surcharge
                                      </th>
                                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'left' }}>
                                        Total Effective Price
                                      </th>
                                      <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'left' }}>
                                        Status
                                      </th>
                                      {isAdmin && (
                                        <th style={{ padding: '8px 12px', fontSize: '0.75rem', textAlign: 'right' }}>
                                          Actions
                                        </th>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {variants.map((v) => {
                                      const surcharge = parseFloat(v.additionalPrice) || 0;
                                      const totalP = (parseFloat(p.salesPrice) || 0) + surcharge;

                                      return (
                                        <tr key={v.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                          <td style={{ padding: '10px 12px', fontSize: '0.84rem', fontWeight: 600 }}>
                                            {v.name}
                                          </td>
                                          <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#64748B' }}>
                                            {v.sku || '—'}
                                          </td>
                                          <td style={{ padding: '10px 12px', fontSize: '0.84rem' }}>
                                            {surcharge > 0 ? (
                                              <span style={{ color: '#059669', fontWeight: 600 }}>
                                                +{formatPrice(surcharge)}
                                              </span>
                                            ) : (
                                              <span className="cell-text-muted">No surcharge ($0)</span>
                                            )}
                                          </td>
                                          <td style={{ padding: '10px 12px', fontSize: '0.84rem', fontWeight: 700 }}>
                                            {formatPrice(totalP)}
                                          </td>
                                          <td style={{ padding: '10px 12px' }}>
                                            <span
                                              className={`status-pill ${
                                                v.isActive !== false ? 'status-pill--active' : 'status-pill--inactive'
                                              }`}
                                              style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                                            >
                                              {v.isActive !== false ? 'Active' : 'Disabled'}
                                            </span>
                                          </td>
                                          {isAdmin && (
                                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                              <div className="action-button-group">
                                                <button
                                                  type="button"
                                                  className="table-action-btn"
                                                  style={{ width: 28, height: 28 }}
                                                  title="Edit Variant"
                                                  onClick={(e) => handleOpenEditVariant(p.id, v, e)}
                                                >
                                                  <Edit2 size={13} />
                                                </button>
                                                <button
                                                  type="button"
                                                  className="table-action-btn table-action-btn--danger"
                                                  style={{ width: 28, height: 28 }}
                                                  title="Remove Variant"
                                                  onClick={(e) => handleDeleteVariant(p.id, v.id, e)}
                                                >
                                                  <Trash2 size={13} />
                                                </button>
                                              </div>
                                            </td>
                                          )}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal (Create / Edit) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialData={editingProduct}
        isLoading={isSavingProduct}
      />

      {/* Variant Modal (Add / Edit on Product) */}
      <VariantModal
        isOpen={isVariantModalOpen}
        onClose={() => {
          setIsVariantModalOpen(false);
          setEditingVariant(null);
        }}
        onSave={handleSaveVariant}
        initialData={editingVariant}
        isLoading={isSavingVariant}
      />

      {/* Archive Product Confirm Dialog */}
      {archivingProduct && (
        <div className="modal-backdrop" onClick={() => setArchivingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-header__title">Archive Product</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                Are you sure you want to archive <strong>{archivingProduct.name}</strong>?
                Existing quotations and active subscriptions using this product will not be affected, but it will be hidden from new orders.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setArchivingProduct(null)}
                disabled={isArchiving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleArchiveConfirm}
                disabled={isArchiving}
              >
                {isArchiving ? <Loader2 size={16} className="spin" /> : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
