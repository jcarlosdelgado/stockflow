import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  X,
  Download,
  Copy,
  Check,
  Percent,
} from 'lucide-react';
import { categoriesApi, productsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/Common/ConfirmModal';
import { Category, Product } from '../types';

export const Products: React.FC = () => {
  const { isAdmin, isWarehouseman } = useAuth();
  const canManage = isAdmin || isWarehouseman;
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [activeOnly, setActiveOnly] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<number | ''>('');
  const [formUnit, setFormUnit] = useState('UNIDAD');
  const [formCostPrice, setFormCostPrice] = useState('0');
  const [formSalePrice, setFormSalePrice] = useState('0');
  const [formMinStock, setFormMinStock] = useState('5');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Confirm Modal State
  const [confirmTarget, setConfirmTarget] = useState<Product | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Load Categories once
  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getProducts({
        search: search.trim() || undefined,
        categoryId: selectedCategory,
        activeOnly: activeOnly,
        page,
        size: 10,
      });
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
      toast.error('Error al sincronizar catálogo de productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, activeOnly, page]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormDesc('');
    setFormCategoryId(categories[0]?.id || '');
    setFormUnit('UNIDAD');
    setFormCostPrice('0.00');
    setFormSalePrice('0.00');
    setFormMinStock('5');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormSku(p.sku);
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormCategoryId(p.categoryId);
    setFormUnit(p.unitOfMeasure);
    setFormCostPrice(p.costPrice.toString());
    setFormSalePrice(p.salePrice.toString());
    setFormMinStock(p.minStock.toString());
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    const payload = {
      sku: formSku,
      name: formName,
      description: formDesc,
      categoryId: Number(formCategoryId),
      unitOfMeasure: formUnit,
      costPrice: parseFloat(formCostPrice),
      salePrice: parseFloat(formSalePrice),
      minStock: parseInt(formMinStock, 10),
    };

    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload);
        toast.success(`Producto "${formName}" actualizado correctamente`);
      } else {
        await productsApi.create(payload);
        toast.success(`Producto "${formName}" registrado en el catálogo`);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setModalError(err.message || 'Error al guardar producto');
      toast.error(err.message || 'Error al guardar el producto');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmToggleActive = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      if (confirmTarget.isActive) {
        await productsApi.deactivate(confirmTarget.id);
        toast.info(`Producto ${confirmTarget.name} desactivado (baja lógica)`);
      } else {
        await productsApi.activate(confirmTarget.id);
        toast.success(`Producto ${confirmTarget.name} reactivado exitosamente`);
      }
      setConfirmTarget(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado del producto');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    toast.info(`SKU ${sku} copiado al portapapeles`);
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.warning('No hay productos disponibles para exportar');
      return;
    }
    const headers = ['ID', 'SKU', 'Nombre', 'Categoria', 'Precio Costo', 'Precio Venta', 'Stock Total', 'Unidad', 'Margen %', 'Estado'];
    const rows = products.map((p) => {
      const margin = p.salePrice > 0 ? (((p.salePrice - p.costPrice) / p.salePrice) * 100).toFixed(1) : '0';
      return [
        p.id,
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.categoryName || ''}"`,
        p.costPrice,
        p.salePrice,
        p.totalStock,
        p.unitOfMeasure,
        `${margin}%`,
        p.isActive ? 'ACTIVO' : 'INACTIVO',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stockflow_productos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Catálogo exportado exitosamente a CSV');
  };

  return (
    <div className="page-container">
      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>
            Catálogo de Productos & Existencias
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {totalElements} producto(s) registrados con control estricto de inventario
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Exportar CSV
          </button>
          {canManage && (
            <button onClick={handleOpenCreate} className="btn btn-primary">
              <Plus size={18} /> Registrar Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por SKU o Nombre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        {/* Category filter */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
          >
            <option value="">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div style={{ minWidth: '150px' }}>
          <select
            className="form-select"
            value={activeOnly === undefined ? '' : activeOnly ? 'true' : 'false'}
            onChange={(e) => {
              const val = e.target.value;
              setActiveOnly(val === '' ? undefined : val === 'true');
              setPage(0);
            }}
          >
            <option value="">Todos los Estados</option>
            <option value="true">Solo Activos</option>
            <option value="false">Solo Inactivos</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto & Descripción</th>
              <th>Categoría</th>
              <th>Precio Costo</th>
              <th>Precio Venta</th>
              <th>Margen</th>
              <th>Existencias & Nivel</th>
              <th>Estado</th>
              {canManage && <th style={{ textAlign: 'right' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isLow = p.isLowStock;
              const margin = p.salePrice > 0 ? (((p.salePrice - p.costPrice) / p.salePrice) * 100).toFixed(1) : '0';
              const stockRatio = p.minStock > 0 ? Math.min(100, Math.round((p.totalStock / (p.minStock * 2)) * 100)) : 100;
              const barColor = isLow ? '#ef4444' : p.totalStock <= p.minStock * 1.5 ? '#f59e0b' : '#10b981';

              return (
                <tr key={p.id}>
                  <td>
                    <button
                      onClick={() => handleCopySku(p.sku)}
                      className="sku-badge"
                      title="Haz clic para copiar SKU"
                    >
                      <span>{p.sku}</span>
                      <Copy size={11} className="copy-icon" />
                    </button>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#09090b' }}>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.55rem', backgroundColor: '#f4f4f5', borderRadius: '4px', border: '1px solid #e4e4e7' }}>
                      {p.categoryName}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>${Number(p.costPrice).toFixed(2)}</td>
                  <td style={{ fontWeight: 700, color: '#09090b' }}>${Number(p.salePrice).toFixed(2)}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: Number(margin) > 20 ? '#16a34a' : '#d97706',
                      backgroundColor: Number(margin) > 20 ? '#f0fdf4' : '#fffbeb',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px'
                    }}>
                      +{margin}%
                    </span>
                  </td>
                  <td style={{ minWidth: '130px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: isLow ? 'var(--warning)' : '#09090b'
                      }}>
                        {p.totalStock} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>{p.unitOfMeasure}</span>
                      </span>
                      {isLow && (
                        <span title="Stock bajo o crítico" style={{ color: 'var(--warning)', display: 'flex' }}>
                          <AlertTriangle size={13} />
                        </span>
                      )}
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#f4f4f5', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${stockRatio}%`, height: '100%', backgroundColor: barColor, borderRadius: '2px', transition: 'width 0.3s ease' }} />
                    </div>
                  </td>
                  <td>
                    {p.isActive ? (
                      <span className="badge badge-success">Activo</span>
                    ) : (
                      <span className="badge badge-danger">Inactivo</span>
                    )}
                  </td>
                  {canManage && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="btn btn-secondary btn-icon"
                          title="Editar Producto"
                        >
                          <Edit2 size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setConfirmTarget(p)}
                            className="btn btn-secondary btn-icon"
                            title={p.isActive ? 'Desactivar (baja lógica)' : 'Reactivar Producto'}
                            style={{ color: p.isActive ? 'var(--danger)' : 'var(--success)' }}
                          >
                            {p.isActive ? <Trash2 size={14} /> : <RotateCcw size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={canManage ? 9 : 8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                  No se encontraron productos con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            className="btn btn-secondary btn-sm"
            disabled={page === 0}
          >
            Anterior
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            className="btn btn-secondary btn-sm"
            disabled={page >= totalPages - 1}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !modalLoading && setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-secondary btn-sm"
                aria-label="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                {modalError && (
                  <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    {modalError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Código SKU *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                      placeholder="PROD-001"
                      required
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nombre del Producto *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ej: Laptop Dell Latitude 5540"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción Detallada</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Especificaciones técnicas o detalles..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Categoría *</label>
                    <select
                      className="form-select"
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(Number(e.target.value))}
                      required
                    >
                      <option value="">Seleccione Categoría</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unidad de Medida *</label>
                    <select
                      className="form-select"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                    >
                      <option value="UNIDAD">UNIDAD</option>
                      <option value="KG">KILOGRAMO (KG)</option>
                      <option value="LITRO">LITRO</option>
                      <option value="METRO">METRO</option>
                      <option value="CAJA">CAJA</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Precio Costo ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Precio Venta ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={formSalePrice}
                      onChange={(e) => setFormSalePrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Mínimo *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={formMinStock}
                      onChange={(e) => setFormMinStock(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={modalLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deactivation/Reactivation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmTarget)}
        title={confirmTarget?.isActive ? 'Desactivar Producto' : 'Reactivar Producto'}
        message={`¿Está seguro de que desea ${confirmTarget?.isActive ? 'desactivar (baja lógica)' : 'reactivar'} el producto "${confirmTarget?.name}" (SKU: ${confirmTarget?.sku})?`}
        confirmText={confirmTarget?.isActive ? 'Desactivar' : 'Reactivar'}
        variant={confirmTarget?.isActive ? 'danger' : 'primary'}
        onConfirm={handleConfirmToggleActive}
        onCancel={() => setConfirmTarget(null)}
        isLoading={confirmLoading}
      />
    </div>
  );
};
