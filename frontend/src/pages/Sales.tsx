import React, { useEffect, useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Receipt,
  Eye,
  Search,
  Printer,
  DollarSign,
  CreditCard,
  Building,
  User,
  X,
  Minus,
} from 'lucide-react';
import { productsApi, salesApi, warehousesApi } from '../api/client';
import { useToast } from '../context/ToastContext';
import { PrintTicketModal } from '../components/Common/PrintTicketModal';
import { Customer, PaymentMethod, Product, Sale, Warehouse } from '../types';

export const Sales: React.FC = () => {
  const toast = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active View Tab: 'list' or 'new'
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');

  // Search & Category Filter in POS
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('all');

  // New Sale Form
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [cartItems, setCartItems] = useState<{ productId: number; quantity: number }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Selected Sale Details Modal / Printable Ticket
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesData, prodData, whData, custData] = await Promise.all([
        salesApi.getAll({ size: 20 }),
        productsApi.getProducts({ size: 100, activeOnly: true }),
        warehousesApi.getAll(true),
        salesApi.getCustomers(),
      ]);
      setSales(salesData.content);
      setProducts(prodData.content);
      setWarehouses(whData);
      setCustomers(custData);
      if (whData.length > 0 && selectedWarehouseId === '') {
        setSelectedWarehouseId(whData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar módulo de ventas');
    } finally {
      setLoading(false);
    }
  };

  // Distinct category list for POS filter pills
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesCat =
        selectedCategoryName === 'all' || p.categoryName === selectedCategoryName;
      return matchesSearch && matchesCat;
    });
  }, [products, catalogSearch, selectedCategoryName]);

  const handleAddToCart = (productId: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    cartItems.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        subtotal += Number(prod.salePrice) * item.quantity;
      }
    });
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  // Cash change calculation
  const cashChange = useMemo(() => {
    if (paymentMethod !== 'CASH' || !cashReceived) return null;
    const received = parseFloat(cashReceived);
    if (isNaN(received)) return null;
    return received - total;
  }, [cashReceived, total, paymentMethod]);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setFormError('Agregue al menos un producto al carrito de venta');
      toast.warning('El carrito está vacío');
      return;
    }
    if (!selectedWarehouseId) {
      setFormError('Seleccione el almacén de despacho de existencias');
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      const newSale = await salesApi.createSale({
        warehouseId: Number(selectedWarehouseId),
        customerId: selectedCustomerId ? Number(selectedCustomerId) : undefined,
        paymentMethod,
        notes,
        items: cartItems,
      });

      setCartItems([]);
      setNotes('');
      setCashReceived('');
      setActiveTab('list');
      setViewingSale(newSale);
      setIsPrintModalOpen(true);
      toast.success(`Venta ${newSale.invoiceNumber} registrada. Existencias descontadas.`);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Error al procesar la venta');
      toast.error(err.message || 'Error al procesar la venta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header and View Mode Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>
            Ventas & Facturación Comercial
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Registro transaccional de ventas con descuento inmediato de inventario
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('list')}
            className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Receipt size={16} /> Historial de Facturas
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`btn ${activeTab === 'new' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Plus size={16} /> Nueva Venta (POS)
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* VIEW: New Sale (POS) */}
      {activeTab === 'new' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Products Selector Grid with Search and Category Pills */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por nombre o SKU..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setSelectedCategoryName('all')}
                className={`pill-btn ${selectedCategoryName === 'all' ? 'active' : ''}`}
              >
                Todos ({products.length})
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryName(cat)}
                  className={`pill-btn ${selectedCategoryName === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
              gap: '0.85rem',
              maxHeight: '580px',
              overflowY: 'auto',
              paddingRight: '0.35rem'
            }}>
              {filteredProducts.map((p) => {
                const inCart = cartItems.find((item) => item.productId === p.id);
                return (
                  <div
                    key={p.id}
                    className="glass-card product-card-hover"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: inCart ? '1px solid #09090b' : '1px solid var(--border-color)',
                      backgroundColor: inCart ? '#fafafa' : '#ffffff',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#71717a', fontFamily: 'monospace', fontWeight: 700 }}>
                          {p.sku}
                        </span>
                        {inCart && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#09090b', color: '#ffffff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            x{inCart.quantity}
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginTop: '0.35rem', marginBottom: '0.5rem', color: '#09090b' }}>
                        {p.name}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#09090b' }}>
                          ${Number(p.salePrice).toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: p.totalStock > 0 ? '#16a34a' : 'var(--danger)', fontWeight: 600 }}>
                          Stock: {p.totalStock}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', fontSize: '0.8rem' }}
                        disabled={p.totalStock <= 0}
                      >
                        <Plus size={14} /> {inCart ? 'Añadir Otro' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No se encontraron productos coincidentes
                </div>
              )}
            </div>
          </div>

          {/* Cart & Checkout Panel */}
          <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '85px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#09090b' }}>
              <ShoppingCart size={20} /> Carrito de Venta ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>

            {formError && (
              <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSale}>
              <div className="form-group">
                <label className="form-label">Almacén de Despacho *</label>
                <select
                  className="form-select"
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
                  required
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Cliente</label>
                  <select
                    className="form-select"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">Venta Mostrador</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Método de Pago *</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    required
                  >
                    <option value="CASH">Efectivo</option>
                    <option value="TRANSFER">Transferencia</option>
                    <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                    <option value="DEBIT_CARD">Tarjeta de Débito</option>
                  </select>
                </div>
              </div>

              {/* Cart Items List */}
              <div style={{
                margin: '1rem 0',
                maxHeight: '200px',
                overflowY: 'auto',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                padding: '0.5rem 0'
              }}>
                {cartItems.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  const itemTotal = Number(prod.salePrice) * item.quantity;
                  return (
                    <div key={item.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0', gap: '0.5rem' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#09090b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ${Number(prod.salePrice).toFixed(2)} c/u
                        </div>
                      </div>

                      {/* Stepper Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '0.25rem' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '22px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '0.25rem' }}
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '0.25rem', marginLeft: '0.25rem', color: 'var(--danger)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div style={{ minWidth: '65px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', color: '#09090b' }}>
                        ${itemTotal.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
                {cartItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Agregue productos del catálogo para facturar
                  </div>
                )}
              </div>

              {/* Cash change calculator */}
              {paymentMethod === 'CASH' && cartItems.length > 0 && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.825rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Monto Recibido ($):</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      style={{
                        width: '100px',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.85rem',
                        textAlign: 'right',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  {cashChange !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.35rem', borderTop: '1px dashed #cbd5e1' }}>
                      <span>Vuelto / Cambio:</span>
                      <span style={{ color: cashChange >= 0 ? '#16a34a' : 'var(--danger)' }}>
                        {cashChange >= 0 ? `$${cashChange.toFixed(2)}` : 'Monto insuficiente'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Subtotal, Tax, Total */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Impuesto (16% IVA):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#09090b', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <span>Total a Pagar:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
                disabled={submitting || cartItems.length === 0}
              >
                {submitting ? 'Procesando Venta e Inventario...' : 'Emitir Factura y Descontar Stock'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* VIEW: Sales List */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Factura</th>
                <th>Cliente</th>
                <th>Almacén</th>
                <th>Vendedor</th>
                <th>Método de Pago</th>
                <th>Total Facturado</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th style={{ textAlign: 'right' }}>Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#09090b' }}>
                      {s.invoiceNumber}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.customerName}</td>
                  <td>{s.warehouseName}</td>
                  <td>{s.userName}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.5rem', backgroundColor: '#f4f4f5', borderRadius: '4px', border: '1px solid #e4e4e7' }}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '0.95rem', color: '#09090b' }}>
                    ${Number(s.total).toFixed(2)}
                  </td>
                  <td>
                    <span className="badge badge-success">{s.status}</span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setViewingSale(s);
                        setIsPrintModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      title="Ver e Imprimir Ticket"
                    >
                      <Printer size={14} /> Ver Ticket
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    No se han registrado ventas todavía
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Printable Ticket Modal */}
      <PrintTicketModal
        isOpen={isPrintModalOpen}
        sale={viewingSale}
        onClose={() => {
          setIsPrintModalOpen(false);
          setViewingSale(null);
        }}
      />
    </div>
  );
};
