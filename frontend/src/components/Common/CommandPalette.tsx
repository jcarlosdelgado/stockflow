import React, { useEffect, useState } from 'react';
import { Search, Package, ShoppingCart, Truck, Warehouse, ArrowRight, X } from 'lucide-react';
import { productsApi } from '../../api/client';
import { Product } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await productsApi.getProducts({ search: query.trim(), page: 0, size: 5 });
          setProducts(res.content || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setProducts([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const quickNavItems = [
    { label: 'Ir a Catálogo de Productos', view: 'products', icon: <Package size={16} /> },
    { label: 'Ir a Punto de Venta (POS)', view: 'sales', icon: <ShoppingCart size={16} /> },
    { label: 'Ir a Movimientos de Inventario', view: 'inventory', icon: <Truck size={16} /> },
    { label: 'Ir a Gestión de Almacenes', view: 'warehouses', icon: <Warehouse size={16} /> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
      <div
        className="modal-content"
        style={{ maxWidth: '560px', padding: 0, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          gap: '0.75rem',
          backgroundColor: '#ffffff'
        }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar productos por SKU o nombre, o navegar por el sistema..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              background: 'transparent'
            }}
          />
          <kbd style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.4rem',
            backgroundColor: '#f4f4f5',
            border: '1px solid #e4e4e7',
            borderRadius: '4px',
            color: 'var(--text-muted)'
          }}>ESC</kbd>
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.75rem' }}>
          {query.trim().length >= 2 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.4rem 0.6rem' }}>
                Productos Encontrados {loading && '...'}
              </div>
              {products.length === 0 && !loading && (
                <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No se encontraron productos con "{query}"
                </div>
              )}
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onNavigate('products');
                    onClose();
                  }}
                  className="command-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {p.sku} • Stock: {p.totalStock} unidades • ${Number(p.salePrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          )}

          {/* Quick Navigation Section */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.4rem 0.6rem' }}>
              Navegación Rápida
            </div>
            {quickNavItems.map((item) => (
              <div
                key={item.view}
                onClick={() => {
                  onNavigate(item.view);
                  onClose();
                }}
                className="command-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
