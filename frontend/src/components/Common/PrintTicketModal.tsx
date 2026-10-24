import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { Sale } from '../../types';

interface PrintTicketModalProps {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export const PrintTicketModal: React.FC<PrintTicketModalProps> = ({ isOpen, sale, onClose }) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '420px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Ticket de Venta</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="printable-ticket" style={{
          padding: '1.75rem',
          backgroundColor: '#ffffff',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '0.82rem',
          color: '#111827',
          lineHeight: 1.4
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#09090b', letterSpacing: '-0.02em' }}>
              STOCKFLOW CORP.
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>SISTEMA DE GESTION EMPRESARIAL</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>RUC / ID: 20601234567</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{sale.warehouseName || 'Almacén Central'}</div>
          </div>

          <div style={{ borderTop: '1px dashed #d1d5db', borderBottom: '1px dashed #d1d5db', padding: '0.6rem 0', margin: '0.8rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>FACTURA:</span>
              <span style={{ fontWeight: 700 }}>{sale.invoiceNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>FECHA:</span>
              <span>{new Date(sale.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>CLIENTE:</span>
              <span>{sale.customerName || 'Cliente General'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ATENDIDO POR:</span>
              <span>{sale.userName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>FORMA PAGO:</span>
              <span style={{ fontWeight: 600 }}>{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.3rem', marginBottom: '0.4rem' }}>
              <span>DESCRIPCION</span>
              <span style={{ textAlign: 'center' }}>CANT</span>
              <span style={{ textAlign: 'right' }}>TOTAL</span>
            </div>
            {sale.items?.map((item) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '0.2rem 0' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.productName}
                </span>
                <span style={{ textAlign: 'center' }}>x{item.quantity}</span>
                <span style={{ textAlign: 'right', fontWeight: 600 }}>${Number(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed #d1d5db', paddingTop: '0.6rem', marginTop: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Subtotal:</span>
              <span>${Number(sale.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Impuesto (18%):</span>
              <span>${Number(sale.tax).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#09090b' }}>
              <span>TOTAL PAGADO:</span>
              <span>${Number(sale.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode representation */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '0.8rem', borderTop: '1px dashed #e5e7eb' }}>
            <div style={{
              letterSpacing: '4px',
              fontFamily: "'Libre Barcode 128', monospace",
              fontSize: '1.5rem',
              fontWeight: 700,
              userSelect: 'none',
              lineHeight: 1
            }}>
              ||| |||| || ||||| ||| |||| |||
            </div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              {sale.invoiceNumber}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem' }}>
              ¡Gracias por su compra en StockFlow!
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', backgroundColor: '#fafafa' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} /> Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>
  );
};
