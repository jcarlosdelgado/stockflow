import React, { useEffect, useState } from 'react';
import { Plus, MapPin, Eye, X, Building2 } from 'lucide-react';
import { warehousesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Warehouse, WarehouseStockItem } from '../types';

export const Warehouses: React.FC = () => {
  const { isAdmin } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected warehouse stocks modal
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStockItem[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);

  // Create warehouse modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await warehousesApi.getAll();
      setWarehouses(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar almacenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleViewStocks = async (wh: Warehouse) => {
    setSelectedWarehouse(wh);
    setStocksLoading(true);
    try {
      const stocks = await warehousesApi.getWarehouseStocks(wh.id);
      setWarehouseStocks(stocks);
    } catch (err: any) {
      alert(err.message || 'Error al cargar existencias');
    } finally {
      setStocksLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      await warehousesApi.create({
        code: formCode.toUpperCase().trim(),
        name: formName.trim(),
        address: formAddress.trim(),
      });
      setIsCreateOpen(false);
      setFormCode('');
      setFormName('');
      setFormAddress('');
      fetchWarehouses();
    } catch (err: any) {
      setCreateError(err.message || 'Error al registrar almacén');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Gestión de Almacenes</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Centros de distribución, bodegas y consulta de stock localizado
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Registrar Nuevo Almacén
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Warehouses Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {warehouses.map((wh) => (
          <div key={wh.id} className="glass-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#f5f5f7',
                    color: '#1d1d1f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <span style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      background: '#f5f5f7',
                      color: '#1d1d1f',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      border: '1px solid rgba(0, 0, 0, 0.06)'
                    }}>
                      {wh.code}
                    </span>
                  </div>
                </div>
                <span className={`badge ${wh.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {wh.isActive ? 'Operativo' : 'Inactivo'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {wh.name}
              </h3>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '0.15rem', color: 'var(--text-muted)' }} />
                <span>{wh.address || 'Sin dirección registrada'}</span>
              </div>
            </div>

            <div style={{ paddingTop: '1.15rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleViewStocks(wh)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', borderRadius: 'var(--radius-full)' }}
              >
                <Eye size={16} /> Consultar Existencias en Este Almacén
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stocks Drawer / Modal */}
      {selectedWarehouse && (
        <div className="modal-overlay" onClick={() => setSelectedWarehouse(null)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  Existencias en {selectedWarehouse.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Código: {selectedWarehouse.code}
                </span>
              </div>
              <button
                onClick={() => setSelectedWarehouse(null)}
                className="btn btn-secondary btn-icon"
                title="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {stocksLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Cargando existencias del almacén...
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Producto</th>
                        <th>Cantidad Disponible</th>
                        <th>Última Actualización</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouseStocks.map((s) => (
                        <tr key={s.stockId}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-500)' }}>
                            {s.productSku}
                          </td>
                          <td style={{ fontWeight: 600 }}>{s.productName}</td>
                          <td>
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: s.quantity > 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                              {s.quantity}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(s.updatedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {warehouseStocks.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No hay productos con existencias en este almacén actualmente
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedWarehouse(null)} className="btn btn-secondary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Warehouse Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Registrar Nuevo Almacén</h3>
              <button onClick={() => setIsCreateOpen(false)} className="btn btn-secondary btn-icon" title="Cerrar">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {createError && (
                  <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {createError}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Código del Almacén * (Ej: WH-SUR)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="WH-SUR"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre del Almacén *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Almacén Sucursal Sur"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección Física</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Av. Las Américas, Galpón 8"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary" disabled={createLoading}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creando...' : 'Guardar Almacén'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
