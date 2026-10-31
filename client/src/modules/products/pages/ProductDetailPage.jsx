/**
 * ProductDetailPage.jsx
 * Enterprise Product Detail Overview inspired by Stripe & Linear.
 * Displays margin economics, variants list, and specifications with shared components.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  Check,
  Edit2,
  Layers,
  Loader2,
  Package,
  Plus,
  Tag,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import StatusBadge from '../../../components/common/StatusBadge.jsx';
import Card from '../../../components/common/Card.jsx';
import ProductModal from '../components/ProductModal.jsx';
import VariantModal from '../components/VariantModal.jsx';
import {
  createVariantApi,
  deleteVariantApi,
  getProductByIdApi,
  updateProductApi,
  updateVariantApi,
} from '../services/product.api.js';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isStaff, isCustomer } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  const fetchProduct = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getProductByIdApi(id);
      if (response.success && response.data?.product) {
        setProduct(response.data.product);
      } else {
        setError('Product record not found.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load product details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleUpdateProduct = async (formData) => {
    setIsSavingProduct(true);
    try {
      await updateProductApi(id, formData);
      setSuccessMessage('Product updated successfully.');
      await fetchProduct();
      setIsEditProductOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleSaveVariant = async (variantData) => {
    setIsSavingVariant(true);
    try {
      if (editingVariant) {
        await updateVariantApi(id, editingVariant.id, variantData);
        setSuccessMessage('Variant updated.');
      } else {
        await createVariantApi(id, variantData);
        setSuccessMessage('Variant added.');
      }
      setIsVariantModalOpen(false);
      setEditingVariant(null);
      await fetchProduct();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save variant.');
    } finally {
      setIsSavingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) return;
    try {
      await deleteVariantApi(id, variantId);
      setSuccessMessage('Variant removed.');
      await fetchProduct();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete variant.');
    }
  };

  const formatPrice = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px', color: '#4F46E5' }} />
        <p style={{ color: '#64748B', fontSize: '14px' }}>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="alert alert--danger">
          <AlertCircle size={18} />
          <span>{error || 'Product not found.'}</span>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          style={{ marginTop: '16px' }}
          onClick={() => navigate('/products')}
        >
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </button>
      </div>
    );
  }

  const salesPrice = parseFloat(product.salesPrice) || 0;
  const costPrice = product.costPrice ? parseFloat(product.costPrice) : null;
  const margin = costPrice !== null ? salesPrice - costPrice : null;
  const marginPercent = margin !== null && salesPrice > 0 ? ((margin / salesPrice) * 100).toFixed(1) : null;

  return (
    <div className="product-detail-view">
      {/* Shared Page Header */}
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku || 'None'} · Type: ${product.productType}${product.unit ? ` · Unit: /${product.unit}` : ''}`}
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Products', to: '/products' },
          { label: product.name },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/products')}
            >
              <ArrowLeft size={16} />
              <span>Back to Products</span>
            </button>
            {isAdmin && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setIsEditProductOpen(true)}
              >
                <Edit2 size={15} />
                <span>Edit Product</span>
              </button>
            )}
          </div>
        }
      />

      {/* Notifications */}
      {successMessage && (
        <div className="alert alert--success" style={{ marginBottom: '16px' }}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert--danger" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Product Overview Card */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Package size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {product.name}
                </h2>
                <StatusBadge status={product.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', flexWrap: 'wrap', fontSize: '13px', color: '#64748B' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Barcode size={14} />
                  <span>SKU: {product.sku || 'None'}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Tag size={14} />
                  <span>Type: {product.productType}</span>
                </span>
                {product.unit && <span>Unit: /{product.unit}</span>}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Metrics Cards (Admin & Staff) */}
      {!isCustomer && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <Card title="Base Sales Price">
            <div style={{ marginTop: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>
                {formatPrice(salesPrice)}
              </span>
              <span style={{ fontSize: '13px', color: '#64748B', marginLeft: '4px' }}>
                {product.unit ? `/${product.unit}` : ''}
              </span>
            </div>
          </Card>

          <Card title="Internal Cost Price">
            <div style={{ marginTop: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#64748B' }}>
                {costPrice !== null ? formatPrice(costPrice) : 'Not configured'}
              </span>
            </div>
          </Card>

          <Card title="Profit Margin">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>
                {margin !== null ? formatPrice(margin) : '—'}
              </span>
              {marginPercent !== null && (
                <span
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <TrendingUp size={12} />
                  <span>{marginPercent}%</span>
                </span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Description */}
      <Card title="Description & Specifications" style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
          {product.description || 'No description provided for this product.'}
        </p>
      </Card>

      {/* Product Variants Table Card */}
      <Card
        title="Product Variants & Surcharges"
        subtitle="Configured add-on tiers, compute sizes, or licensing options."
        action={
          isAdmin && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                setEditingVariant(null);
                setIsVariantModalOpen(true);
              }}
            >
              <Plus size={14} />
              <span>Add Variant</span>
            </button>
          )
        }
        padding="none"
      >
        {(!product.variants || product.variants.length === 0) ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Layers size={36} style={{ color: '#94A3B8', margin: '0 auto 10px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
              No variants configured
            </h4>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '360px', margin: '0 auto' }}>
              Add variants to offer multiple tiers, license sizes, or regional surcharges under this product.
            </p>
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="shared-data-table">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Variant Name</th>
                  <th style={{ width: '20%' }}>SKU</th>
                  <th style={{ width: '18%' }}>Surcharge</th>
                  <th style={{ width: '20%' }}>Total Effective Price</th>
                  <th style={{ width: '12%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => {
                  const surcharge = parseFloat(v.additionalPrice) || 0;
                  const totalEffective = salesPrice + surcharge;

                  return (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600, color: '#0F172A' }}>{v.name}</td>
                      <td style={{ color: '#64748B' }}>{v.sku || '—'}</td>
                      <td>
                        {surcharge > 0 ? (
                          <span style={{ color: '#059669', fontWeight: 600 }}>
                            +{formatPrice(surcharge)}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>$0.00</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>
                        {formatPrice(totalEffective)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isAdmin && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button
                              type="button"
                              className="btn-icon"
                              title="Edit Variant"
                              onClick={() => {
                                setEditingVariant(v);
                                setIsVariantModalOpen(true);
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon--danger"
                              title="Delete Variant"
                              onClick={() => handleDeleteVariant(v.id)}
                            >
                              <Trash2 size={14} />
                            </button>
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
      </Card>

      {/* Edit Product Modal */}
      {isEditProductOpen && (
        <ProductModal
          isOpen={isEditProductOpen}
          onClose={() => setIsEditProductOpen(false)}
          onSave={handleUpdateProduct}
          initialData={product}
          isLoading={isSavingProduct}
        />
      )}

      {/* Add / Edit Variant Modal */}
      {isVariantModalOpen && (
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
      )}
    </div>
  );
};

export default ProductDetailPage;
