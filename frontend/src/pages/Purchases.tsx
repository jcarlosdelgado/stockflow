import React, { useEffect, useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  PackageCheck,
  CheckCircle,
  Clock,
  Eye,
  Building2,
  DollarSign,
  X,
} from 'lucide-react';
import { productsApi, purchasesApi, warehousesApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/Common/ConfirmModal';
import { Product, PurchaseOrder, Supplier, Warehouse } from '../types';

export const Purchases: React.FC = () => {
  const toast = useToast();
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab: 'list' or 'new'
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');

  // New Purchase Form
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: number; quantity: number; unitCost: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // View Modal
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);

  // Suppliers Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupCompany, setNewSupCompany] = useState('');
  const [newSupDoc, setNewSupDoc] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [poData, supData, whData, prodData] = await Promise.all([
        purchasesApi.getAll({ size: 20 }),
        purchasesApi.getSuppliers(true),
        warehousesApi.getAll(true),
        productsApi.getProducts({ size: 100 }),
      ]);
      setPurchases(poData.content);
      setSuppliers(supData);
      setWarehouses(whData);
      setProducts(prodData.content);

      if (supData.length > 0 && supplierId === '') setSupplierId(supData[0].id);
      if (whData.length > 0 && warehouseId === '') setWarehouseId(whData[0].id);
    } catch (err: any) {
      setError(err.message || 'Error al cargar módulo de compras');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1, unitCost: Number(prod.costPrice) }];
    });
  };

  const handleUpdateItem = (productId: number, field: 'quantity' | 'unitCost', value: number) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (productId: number) => {
    setOrderItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      setFormError('Agregue al menos un producto a la orden de compra');
      return;
    }
    if (!supplierId || !warehouseId) {
      setFormError('Seleccione proveedor y almacén de destino');
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await purchasesApi.createOrder({
        supplierId: Number(supplierId),
        warehouseId: Number(warehouseId),
        notes,
        items: orderItems,
      });
      setOrderItems([]);
      setNotes('');
      setActiveTab('list');
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Error al crear orden de compra');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm reception modal state
  const [orderToReceive, setOrderToReceive] = useState<PurchaseOrder | null>(null);
  const [receiveLoading, setReceiveLoading] = useState(false);

  const handleConfirmReceive = async () => {
    if (!orderToReceive) return;
    setReceiveLoading(true);
    try {
      await purchasesApi.receiveOrder(orderToReceive.id);
      toast.success(`Orden ${orderToReceive.orderNumber} recepcionada exitosamente. El inventario ha sido actualizado.`);
      setOrderToReceive(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al recepcionar mercancía');
    } finally {
      setReceiveLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await purchasesApi.createSupplier({
        companyName: newSupCompany,
        documentNumber: newSupDoc,
        contactName: newSupContact,
        email: newSupEmail,
        phone: newSupPhone,
        address: newSupAddress,
      });
      setIsSupplierModalOpen(false);
      setNewSupCompany('');
      toast.success('Proveedor registrado correctamente');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear proveedor');
    }
  };

  return (
    <div className="page-container">
      {/* Header and View Mode Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Compras & Órdenes de Abastecimiento</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Gestión de compras a proveedores con ingreso formal a inventario
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('list')}
            className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Clock size={16} /> Historial de Órdenes
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`btn ${activeTab === 'new' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Plus size={16} /> Nueva Orden de Compra
          </button>
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="btn btn-secondary"
          >
            <Building2 size={16} /> Proveedores
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* VIEW: New Purchase Order */}
      {activeTab === 'new' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Products Selector */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Productos para Solicitar
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.85rem',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              {products.map((p) => (
                <div key={p.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary-500)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {p.sku}
                    </span>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
                      {p.name}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Costo ref: ${Number(p.costPrice).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddItem(p.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', fontSize: '0.75rem' }}
                    >
                      <Plus size={14} /> Solicitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details & Items Form */}
          <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '85px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="var(--primary-500)" /> Detalle de la Orden
            </h3>

            {formError && (
              <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateOrder}>
              <div className="form-group">
                <label className="form-label">Proveedor *</label>
                <select className="form-select" value={supplierId} onChange={(e) => setSupplierId(Number(e.target.value))} required>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Almacén de Recepción (Destino) *</label>
                <select className="form-select" value={warehouseId} onChange={(e) => setWarehouseId(Number(e.target.value))} required>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div style={{
                margin: '1rem 0',
                maxHeight: '220px',
                overflowY: 'auto',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                padding: '0.75rem 0'
              }}>
                {orderItems.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  const itemTotal = item.unitCost * item.quantity;
                  return (
                    <div key={item.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', gap: '0.5rem' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Costo:</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateItem(item.productId, 'unitCost', parseFloat(e.target.value) || 0)}
                            style={{
                              width: '65px',
                              padding: '0.15rem 0.35rem',
                              fontSize: '0.75rem',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid var(--border-color)',
                              color: 'white',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.productId, 'quantity', parseInt(e.target.value, 10) || 1)}
                          style={{
                            width: '50px',
                            padding: '0.25rem',
                            textAlign: 'center',
                            borderRadius: '4px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-color)',
                            color: 'white'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '0.3rem', color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ minWidth: '65px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem' }}>
                        ${itemTotal.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
                {orderItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Agregue productos para conformar la orden de compra
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                <span>Monto Estimado:</span>
                <span style={{ color: 'var(--primary-500)' }}>${calculateTotal().toFixed(2)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
                disabled={submitting || orderItems.length === 0}
              >
                {submitting ? 'Generando Orden...' : 'Crear Orden de Compra (PENDIENTE)'}
              </button>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.65rem' }}>
                * El inventario NO aumentará hasta que se confirme la recepción de la mercancía.
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* VIEW: Purchases List */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Orden</th>
                <th>Proveedor</th>
                <th>Almacén Destino</th>
                <th>Monto Total</th>
                <th>Estado</th>
                <th>Fecha Emisión</th>
                <th>Recepción</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((po) => (
                <tr key={po.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-500)' }}>
                      {po.orderNumber}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{po.supplierCompanyName}</td>
                  <td>{po.warehouseName}</td>
                  <td style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    ${Number(po.totalAmount).toFixed(2)}
                  </td>
                  <td>
                    {po.status === 'PENDING' ? (
                      <span className="badge badge-warning">Pendiente</span>
                    ) : po.status === 'RECEIVED' ? (
                      <span className="badge badge-success">Recepcionada</span>
                    ) : (
                      <span className="badge badge-danger">Cancelada</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(po.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {po.receivedAt ? new Date(po.receivedAt).toLocaleString() : 'En espera'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => setViewingOrder(po)}
                        className="btn btn-secondary btn-icon"
                        title="Ver Detalle"
                      >
                        <Eye size={15} />
                      </button>
                      {po.status === 'PENDING' && (
                        <button
                          onClick={() => setOrderToReceive(po)}
                          className="btn btn-primary btn-sm"
                          title="Confirmar Entrada al Almacén"
                        >
                          <PackageCheck size={15} /> Recepcionar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No hay órdenes de compra registradas actualmente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="modal-overlay" onClick={() => setViewingOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Orden de Compra {viewingOrder.orderNumber}</h3>
              <button onClick={() => setViewingOrder(null)} className="btn btn-secondary btn-sm" aria-label="Cerrar"><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Proveedor:</span>
                  <div style={{ fontWeight: 600 }}>{viewingOrder.supplierCompanyName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Almacén Destino:</span>
                  <div style={{ fontWeight: 600 }}>{viewingOrder.warehouseName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Creado por:</span>
                  <div>{viewingOrder.userName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Estado:</span>
                  <div>{viewingOrder.status}</div>
                </div>
              </div>

              <div className="table-container" style={{ marginBottom: '1.25rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Costo Unit.</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.productName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.productSku}</div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>${Number(item.unitCost).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          ${Number(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800 }}>
                <span>Monto Total:</span>
                <span style={{ color: 'var(--primary-500)' }}>${Number(viewingOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setViewingOrder(null)} className="btn btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSupplierModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Registrar Nuevo Proveedor</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="btn btn-secondary btn-sm" aria-label="Cerrar"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateSupplier}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Razón Social / Empresa *</label>
                  <input type="text" className="form-input" value={newSupCompany} onChange={(e) => setNewSupCompany(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Documento Fiscal (RFC / RIF / NIT)</label>
                  <input type="text" className="form-input" value={newSupDoc} onChange={(e) => setNewSupDoc(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Persona de Contacto</label>
                    <input type="text" className="form-input" value={newSupContact} onChange={(e) => setNewSupContact(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input type="text" className="form-input" value={newSupPhone} onChange={(e) => setNewSupPhone(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-input" value={newSupEmail} onChange={(e) => setNewSupEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección Fiscal</label>
                  <input type="text" className="form-input" value={newSupAddress} onChange={(e) => setNewSupAddress(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Reception Modal */}
      <ConfirmModal
        isOpen={Boolean(orderToReceive)}
        title="Confirmar Recepción de Mercancía"
        message={`¿Confirmar la recepción física de los productos para la orden ${orderToReceive?.orderNumber} en ${orderToReceive?.warehouseName}? Esta acción sumará automáticamente las existencias al inventario.`}
        confirmText="Confirmar e Ingresar Stock"
        cancelText="Volver"
        variant="primary"
        onConfirm={handleConfirmReceive}
        onCancel={() => setOrderToReceive(null)}
        isLoading={receiveLoading}
      />
    </div>
  );
};
