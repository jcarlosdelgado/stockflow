import React, { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Download,
} from 'lucide-react';
import { inventoryApi, productsApi, warehousesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { InventoryMovement, MovementType, Product, Warehouse } from '../types';

export const Inventory: React.FC = () => {
  const { isAdmin, isWarehouseman } = useAuth();
  const canOperate = isAdmin || isWarehouseman;
  const toast = useToast();

  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterProduct, setFilterProduct] = useState<number | undefined>(undefined);
  const [filterWarehouse, setFilterWarehouse] = useState<number | undefined>(undefined);
  const [filterType, setFilterType] = useState<MovementType | ''>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal: Adjustment
  const [isAdjOpen, setIsAdjOpen] = useState(false);
  const [adjProductId, setAdjProductId] = useState<number | ''>('');
  const [adjWarehouseId, setAdjWarehouseId] = useState<number | ''>('');
  const [adjType, setAdjType] = useState<MovementType>('ENTRY');
  const [adjQuantity, setAdjQuantity] = useState('1');
  const [adjNotes, setAdjNotes] = useState('');
  const [adjLoading, setAdjLoading] = useState(false);
  const [adjError, setAdjError] = useState<string | null>(null);

  // Modal: Transfer
  const [isTrfOpen, setIsTrfOpen] = useState(false);
  const [trfProductId, setTrfProductId] = useState<number | ''>('');
  const [trfSourceId, setTrfSourceId] = useState<number | ''>('');
  const [trfDestId, setTrfDestId] = useState<number | ''>('');
  const [trfQuantity, setTrfQuantity] = useState('1');
  const [trfNotes, setTrfNotes] = useState('');
  const [trfLoading, setTrfLoading] = useState(false);
  const [trfError, setTrfError] = useState<string | null>(null);

  // Load catalogs
  useEffect(() => {
    productsApi.getProducts({ size: 100 }).then((res) => setProducts(res.content)).catch(console.error);
    warehousesApi.getAll(true).then(setWarehouses).catch(console.error);
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryApi.getMovements({
        productId: filterProduct,
        warehouseId: filterWarehouse,
        type: filterType ? filterType : undefined,
        page,
        size: 15,
      });
      setMovements(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [filterProduct, filterWarehouse, filterType, page]);

  // Handle Adjustment Submit
  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjError(null);
    setAdjLoading(true);
    try {
      await inventoryApi.adjustStock({
        productId: Number(adjProductId),
        warehouseId: Number(adjWarehouseId),
        type: adjType,
        quantity: parseInt(adjQuantity, 10),
        notes: adjNotes,
      });
      setIsAdjOpen(false);
      setAdjNotes('');
      toast.success('Ajuste de inventario registrado con éxito');
      fetchMovements();
    } catch (err: any) {
      setAdjError(err.message || 'Error al procesar ajuste de inventario');
      toast.error(err.message || 'Error al procesar ajuste');
    } finally {
      setAdjLoading(false);
    }
  };

  // Handle Transfer Submit
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trfSourceId === trfDestId) {
      setTrfError('El almacén de origen y destino deben ser diferentes');
      toast.warning('Origen y destino no pueden ser el mismo almacén');
      return;
    }
    setTrfError(null);
    setTrfLoading(true);
    try {
      await inventoryApi.transferStock({
        productId: Number(trfProductId),
        sourceWarehouseId: Number(trfSourceId),
        destinationWarehouseId: Number(trfDestId),
        quantity: parseInt(trfQuantity, 10),
        notes: trfNotes,
      });
      setIsTrfOpen(false);
      setTrfNotes('');
      toast.success('Transferencia entre almacenes completada');
      fetchMovements();
    } catch (err: any) {
      setTrfError(err.message || 'Error al procesar transferencia de existencias');
      toast.error(err.message || 'Error al procesar transferencia');
    } finally {
      setTrfLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (movements.length === 0) {
      toast.warning('No hay movimientos para exportar');
      return;
    }
    const headers = ['ID', 'Fecha', 'Tipo', 'SKU', 'Producto', 'Almacen Origen', 'Almacen Destino', 'Cantidad', 'Stock Anterior', 'Nuevo Stock', 'Documento', 'Responsable'];
    const rows = movements.map((m) => [
      m.id,
      `"${new Date(m.createdAt).toISOString()}"`,
      m.type,
      `"${m.productSku}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.warehouseCode}"`,
      `"${m.destinationWarehouseCode || ''}"`,
      m.quantity,
      m.previousStock,
      m.newStock,
      `"${m.referenceId || m.referenceType || ''}"`,
      `"${m.createdByName || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stockflow_movimientos_inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Historial de movimientos exportado a CSV');
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return <span className="badge badge-success"><ArrowDownLeft size={12} /> Entrada</span>;
      case 'EXIT':
        return <span className="badge badge-danger"><ArrowUpRight size={12} /> Salida</span>;
      case 'TRANSFER':
        return <span className="badge badge-info"><ArrowRightLeft size={12} /> Transferencia</span>;
      case 'ADJUSTMENT':
        return <span className="badge badge-warning"><SlidersHorizontal size={12} /> Ajuste</span>;
      default:
        return <span className="badge">{type}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header with actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Trazabilidad & Movimientos de Inventario</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Registro de auditoría inmutable de todas las operaciones físicas de stock
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Exportar CSV
          </button>
          {canOperate && (
            <>
              <button
                onClick={() => {
                  setAdjProductId(products[0]?.id || '');
                  setAdjWarehouseId(warehouses[0]?.id || '');
                  setAdjType('ENTRY');
                  setAdjQuantity('1');
                  setAdjError(null);
                  setIsAdjOpen(true);
                }}
                className="btn btn-secondary"
              >
                <SlidersHorizontal size={16} /> Ajustar Stock Directo
              </button>
              <button
                onClick={() => {
                  setTrfProductId(products[0]?.id || '');
                  setTrfSourceId(warehouses[0]?.id || '');
                  setTrfDestId(warehouses[1]?.id || warehouses[0]?.id || '');
                  setTrfQuantity('1');
                  setTrfError(null);
                  setIsTrfOpen(true);
                }}
                className="btn btn-primary"
              >
                <ArrowRightLeft size={16} /> Transferencia entre Almacenes
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ minWidth: '200px', flex: '1 1 200px' }}>
          <select
            className="form-select"
            value={filterProduct || ''}
            onChange={(e) => {
              setFilterProduct(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
          >
            <option value="">Todos los Productos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={filterWarehouse || ''}
            onChange={(e) => {
              setFilterWarehouse(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
          >
            <option value="">Todos los Almacenes</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as MovementType | '');
              setPage(0);
            }}
          >
            <option value="">Todos los Tipos</option>
            <option value="ENTRY">Entrada</option>
            <option value="EXIT">Salida</option>
            <option value="TRANSFER">Transferencia</option>
            <option value="ADJUSTMENT">Ajuste</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Producto</th>
              <th>Almacén</th>
              <th>Destino</th>
              <th>Cantidad</th>
              <th>Previo → Nuevo</th>
              <th>Operación</th>
              <th>Notas</th>
              <th>Responsable</th>
              <th>Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td>{getMovementBadge(m.type)}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{m.productName}</div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary-500)' }}>{m.productSku}</div>
                </td>
                <td>{m.warehouseName}</td>
                <td>{m.destinationWarehouseName || '—'}</td>
                <td style={{ fontWeight: 800, fontSize: '0.95rem' }}>{m.quantity}</td>
                <td>
                  <span style={{ color: 'var(--text-muted)' }}>{m.previousStock}</span>
                  {' → '}
                  <span style={{ fontWeight: 700, color: m.newStock < m.previousStock ? 'var(--danger)' : 'var(--success)' }}>
                    {m.newStock}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {m.referenceId || m.referenceType}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.notes || '—'}
                </td>
                <td>{m.createdByName}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(m.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {movements.length === 0 && !loading && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No se encontraron movimientos registrados con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button onClick={() => setPage((prev) => Math.max(0, prev - 1))} className="btn btn-secondary btn-sm" disabled={page === 0}>
            Anterior
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Página {page + 1} de {totalPages}
          </span>
          <button onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))} className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1}>
            Siguiente
          </button>
        </div>
      )}

      {/* Adjustment Modal */}
      {isAdjOpen && (
        <div className="modal-overlay" onClick={() => setIsAdjOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Ajuste Directo de Stock</h3>
              <button onClick={() => setIsAdjOpen(false)} className="btn btn-secondary btn-icon" title="Cerrar">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdjustmentSubmit}>
              <div className="modal-body">
                {adjError && (
                  <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {adjError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Producto *</label>
                  <select className="form-select" value={adjProductId} onChange={(e) => setAdjProductId(Number(e.target.value))} required>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Almacén *</label>
                  <select className="form-select" value={adjWarehouseId} onChange={(e) => setAdjWarehouseId(Number(e.target.value))} required>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tipo de Operación *</label>
                    <select className="form-select" value={adjType} onChange={(e) => setAdjType(e.target.value as MovementType)}>
                      <option value="ENTRY">Entrada (+)</option>
                      <option value="EXIT">Salida (-)</option>
                      <option value="ADJUSTMENT">Ajuste / Merma (-)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cantidad *</label>
                    <input type="number" min="1" className="form-input" value={adjQuantity} onChange={(e) => setAdjQuantity(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Motivo o Justificación del Ajuste</label>
                  <textarea className="form-textarea" rows={2} value={adjNotes} onChange={(e) => setAdjNotes(e.target.value)} placeholder="Ej: Ajuste por conteo físico anual / Merma autorizada..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsAdjOpen(false)} className="btn btn-secondary" disabled={adjLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={adjLoading}>
                  {adjLoading ? 'Procesando...' : 'Aplicar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTrfOpen && (
        <div className="modal-overlay" onClick={() => setIsTrfOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Transferencia entre Almacenes</h3>
              <button onClick={() => setIsTrfOpen(false)} className="btn btn-secondary btn-sm" aria-label="Cerrar"><X size={16} /></button>
            </div>
            <form onSubmit={handleTransferSubmit}>
              <div className="modal-body">
                {trfError && (
                  <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {trfError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Producto a Transferir *</label>
                  <select className="form-select" value={trfProductId} onChange={(e) => setTrfProductId(Number(e.target.value))} required>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Almacén de Origen (Despacho) *</label>
                    <select className="form-select" value={trfSourceId} onChange={(e) => setTrfSourceId(Number(e.target.value))} required>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Almacén de Destino (Recepción) *</label>
                    <select className="form-select" value={trfDestId} onChange={(e) => setTrfDestId(Number(e.target.value))} required>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cantidad a Transferir *</label>
                  <input type="number" min="1" className="form-input" value={trfQuantity} onChange={(e) => setTrfQuantity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Notas / Guía de Remisión</label>
                  <textarea className="form-textarea" rows={2} value={trfNotes} onChange={(e) => setTrfNotes(e.target.value)} placeholder="Ej: Traslado por abastecimiento según orden de logística..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsTrfOpen(false)} className="btn btn-secondary" disabled={trfLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={trfLoading}>
                  {trfLoading ? 'Transfiriendo...' : 'Confirmar Transferencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
