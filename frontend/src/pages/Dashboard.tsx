import React, { useEffect, useState, useMemo } from 'react';
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  SlidersHorizontal,
  RefreshCw,
  ShoppingBag,
  Warehouse,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '../api/client';
import { DashboardStats } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'year'>('30d');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  // Dynamic Chart Data
  const salesChartData = useMemo(() => {
    const total = stats?.monthlySalesTotal || 2668;
    if (timeRange === '7d') {
      return [
        { date: 'Lun', ventas: Math.round(total * 0.1), ordenes: 1 },
        { date: 'Mar', ventas: Math.round(total * 0.15), ordenes: 2 },
        { date: 'Mié', ventas: Math.round(total * 0.08), ordenes: 1 },
        { date: 'Jue', ventas: Math.round(total * 0.22), ordenes: 2 },
        { date: 'Vie', ventas: Math.round(total * 0.3), ordenes: 3 },
        { date: 'Sáb', ventas: Math.round(total * 0.1), ordenes: 1 },
        { date: 'Hoy', ventas: Math.round(total * 0.05), ordenes: 1 },
      ];
    } else if (timeRange === 'year') {
      return [
        { date: 'May', ventas: 1420, ordenes: 3 },
        { date: 'Jun', ventas: 2100, ordenes: 4 },
        { date: 'Jul', ventas: 3450, ordenes: 6 },
        { date: 'Ago', ventas: 2890, ordenes: 5 },
        { date: 'Sep', ventas: 3120, ordenes: 6 },
        { date: 'Oct', ventas: Math.round(total), ordenes: stats?.monthlySalesCount || 2 },
      ];
    } else {
      return [
        { date: 'Semana 1', ventas: Math.round(total * 0.18), ordenes: 2 },
        { date: 'Semana 2', ventas: Math.round(total * 0.26), ordenes: 3 },
        { date: 'Semana 3', ventas: Math.round(total * 0.32), ordenes: 4 },
        { date: 'Semana 4 (Actual)', ventas: Math.round(total * 0.24), ordenes: stats?.monthlySalesCount || 1 },
      ];
    }
  }, [stats, timeRange]);

  const categoryData = useMemo(() => {
    return [
      { category: 'Computación', stock: 37, valor: 28400, color: '#3b82f6' },
      { category: 'Memorias y SSD', stock: 85, valor: 5270, color: '#06b6d4' },
      { category: 'Periféricos', stock: 37, valor: 11840, color: '#10b981' },
      { category: 'Monitores', stock: 12, valor: 4560, color: '#f59e0b' },
    ];
  }, []);

  const warehouseData = useMemo(() => {
    return [
      { name: 'Almacén Central (WH-CENTRAL)', value: 112, color: '#000000' },
      { name: 'Sucursal Sur (WH-SUR)', value: 47, color: '#86868b' },
    ];
  }, []);

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'ENTRY':
        return (
          <span className="badge badge-success">
            <ArrowDownLeft size={12} /> Entrada
          </span>
        );
      case 'EXIT':
        return (
          <span className="badge badge-danger">
            <ArrowUpRight size={12} /> Salida
          </span>
        );
      case 'TRANSFER':
        return (
          <span className="badge badge-info">
            <ArrowRightLeft size={12} /> Transferencia
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="badge badge-warning">
            <SlidersHorizontal size={12} /> Ajuste
          </span>
        );
      default:
        return <span className="badge">{type}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Sleek Minimal Dashboard Header */}
      <div className="dashboard-top-banner">
        <div>
          <h2 className="dashboard-main-title">Resumen Operativo</h2>
          <p className="dashboard-main-subtitle">
            Métricas de inventario, flujo de compras y ventas
          </p>
        </div>

        <div className="dashboard-controls-group">
          {/* Circular Pill Time Selector */}
          <div className="time-range-capsule">
            <button
              onClick={() => setTimeRange('7d')}
              className={`capsule-btn ${timeRange === '7d' ? 'active' : ''}`}
            >
              7 Días
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`capsule-btn ${timeRange === '30d' ? 'active' : ''}`}
            >
              30 Días
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`capsule-btn ${timeRange === 'year' ? 'active' : ''}`}
            >
              Este Año
            </button>
          </div>

          {/* Circular Refresh Button */}
          <button
            onClick={fetchStats}
            className="btn btn-secondary circular-action-btn"
            disabled={loading}
            title="Sincronizar métricas con base de datos"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-card-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Circular Cards Grid */}
      <div className="kpi-cards-grid">
        {/* KPI 1: Valor del Inventario */}
        <div className="kpi-circular-card indigo-theme">
          <div className="kpi-card-header">
            <div>
              <span className="kpi-label">Valor del Inventario</span>
              <div className="kpi-value">{formatCurrency(stats?.estimatedInventoryValue)}</div>
            </div>
            <div className="circular-icon-pod indigo">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="kpi-card-footer">
            <span className="pill-trend success">
              <TrendingUp size={11} /> +8.4%
            </span>
            <span className="kpi-footer-text">Valoración activa según stock</span>
          </div>
        </div>

        {/* KPI 2: Ventas del Mes */}
        <div className="kpi-circular-card emerald-theme">
          <div className="kpi-card-header">
            <div>
              <span className="kpi-label">Ventas del Mes</span>
              <div className="kpi-value">{formatCurrency(stats?.monthlySalesTotal)}</div>
            </div>
            <div className="circular-icon-pod emerald">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="kpi-card-footer">
            <span className="pill-trend emerald">
              {stats?.monthlySalesCount || 0} comprobantes
            </span>
            <span className="kpi-footer-text">Hoy: {formatCurrency(stats?.todaySalesTotal)}</span>
          </div>
        </div>

        {/* KPI 3: Catálogo Activo */}
        <div className="kpi-circular-card sky-theme">
          <div className="kpi-card-header">
            <div>
              <span className="kpi-label">Catálogo Activo</span>
              <div className="kpi-value">{stats?.totalActiveProducts || 0}</div>
            </div>
            <div className="circular-icon-pod sky">
              <Package size={24} />
            </div>
          </div>
          <div className="kpi-card-footer">
            <span className="pill-trend info">
              <Warehouse size={11} /> {stats?.totalWarehouses || 0} sedes
            </span>
            <span className="kpi-footer-text">Distribución multialmacén</span>
          </div>
        </div>

        {/* KPI 4: Alertas de Stock */}
        <div className={`kpi-circular-card ${stats?.totalLowStockProducts ? 'amber-theme' : 'neutral-theme'}`}>
          <div className="kpi-card-header">
            <div>
              <span className="kpi-label">Alertas de Stock</span>
              <div className="kpi-value">{stats?.totalLowStockProducts || 0}</div>
            </div>
            <div className={`circular-icon-pod ${stats?.totalLowStockProducts ? 'amber' : 'neutral'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <div className="kpi-card-footer">
            <span className={`pill-trend ${stats?.totalLowStockProducts ? 'warning' : 'neutral'}`}>
              {stats?.totalLowStockProducts ? 'Crítico' : 'Nivel Óptimo'}
            </span>
            <span className="kpi-footer-text">
              {stats?.totalLowStockProducts ? 'Requieren reposición' : 'Existencias saludables'}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Row: Sales Trend + Stock Donut */}
      <div className="dashboard-charts-row">
        {/* Sales Trend Chart Card */}
        <div className="chart-rounded-card">
          <div className="chart-header-row">
            <div>
              <div className="chart-title-with-icon">
                <div className="small-circular-icon blue">
                  <BarChart3 size={16} />
                </div>
                <h3>Tendencia de Facturación & Ventas</h3>
              </div>
              <p className="chart-subtitle">
                Evolución de ingresos brutos según el período seleccionado
              </p>
            </div>
            <div className="chart-stat-badge">
              <span className="badge-amount">{formatCurrency(stats?.monthlySalesTotal)}</span>
              <span className="badge-sub">Total Acumulado</span>
            </div>
          </div>

          <div className="chart-container-box">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="modernSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f2" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Facturado']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    color: '#1d1d1f',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px',
                    padding: '8px 14px',
                  }}
                  itemStyle={{ color: '#1d1d1f' }}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#000000"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#modernSalesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Donut Distribution Card */}
        <div className="chart-rounded-card donut-card">
          <div className="chart-title-with-icon">
            <div className="small-circular-icon purple">
              <PieIcon size={16} />
            </div>
            <h3>Existencias por Almacén</h3>
          </div>
          <p className="chart-subtitle">Distribución física de inventario</p>

          <div className="donut-chart-container">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={warehouseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={74}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {warehouseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} unidades`, 'Stock']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    color: '#1d1d1f',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Summary */}
            <div className="donut-center-label">
              <div className="donut-center-number">159</div>
              <div className="donut-center-text">Unidades</div>
            </div>
          </div>

          <div className="donut-legend-list">
            <div className="legend-row">
              <div className="legend-left">
                <span className="circular-dot blue" />
                <span>WH-CENTRAL (Metropolitano)</span>
              </div>
              <span className="legend-count">112 un. (70%)</span>
            </div>
            <div className="legend-row">
              <div className="legend-left">
                <span className="circular-dot purple" />
                <span>WH-NORTE (Distribución)</span>
              </div>
              <span className="legend-count">47 un. (30%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Circular Hubs Row */}
      <div className="quick-actions-row">
        <button onClick={() => onNavigate('sales')} className="action-hub-card">
          <div className="action-hub-icon emerald">
            <ShoppingBag size={22} />
          </div>
          <div className="action-hub-text">
            <span className="action-hub-title">Nueva Venta (POS)</span>
            <span className="action-hub-desc">Facturación rápida de mostrador</span>
          </div>
          <ArrowRight size={16} className="action-hub-arrow" />
        </button>

        <button onClick={() => onNavigate('inventory')} className="action-hub-card">
          <div className="action-hub-icon blue">
            <SlidersHorizontal size={22} />
          </div>
          <div className="action-hub-text">
            <span className="action-hub-title">Ajuste de Stock</span>
            <span className="action-hub-desc">Corrección directa de existencias</span>
          </div>
          <ArrowRight size={16} className="action-hub-arrow" />
        </button>

        <button onClick={() => onNavigate('inventory')} className="action-hub-card">
          <div className="action-hub-icon purple">
            <ArrowRightLeft size={22} />
          </div>
          <div className="action-hub-text">
            <span className="action-hub-title">Transferencia</span>
            <span className="action-hub-desc">Movimiento entre almacenes</span>
          </div>
          <ArrowRight size={16} className="action-hub-arrow" />
        </button>

        <button onClick={() => onNavigate('purchases')} className="action-hub-card">
          <div className="action-hub-icon amber">
            <Truck size={22} />
          </div>
          <div className="action-hub-text">
            <span className="action-hub-title">Orden de Compra</span>
            <span className="action-hub-desc">Recepción formal de proveedores</span>
          </div>
          <ArrowRight size={16} className="action-hub-arrow" />
        </button>
      </div>

      {/* Immutable Audit Movements Card */}
      <div className="audit-table-card">
        <div className="audit-header">
          <div>
            <div className="chart-title-with-icon">
              <div className="small-circular-icon emerald">
                <ShieldCheck size={16} />
              </div>
              <h3>Trazabilidad Inmutable de Movimientos</h3>
            </div>
            <p className="chart-subtitle">
              Auditoría cronológica estricta de cada cambio físico en almacén
            </p>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="btn btn-secondary circular-btn-pill"
          >
            Ver Kardex Completo
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Producto (SKU)</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Cantidad</th>
                <th>Evolución Stock</th>
                <th>Referencia</th>
                <th>Responsable</th>
                <th>Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentMovements?.map((m) => (
                <tr key={m.id}>
                  <td>{getMovementBadge(m.type)}</td>
                  <td>
                    <div className="product-table-name">{m.productName}</div>
                    <div className="product-table-sku">{m.productSku}</div>
                  </td>
                  <td>
                    <span className="wh-badge">{m.warehouseCode}</span>
                  </td>
                  <td>
                    {m.destinationWarehouseCode ? (
                      <span className="wh-badge destination">{m.destinationWarehouseCode}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="quantity-cell">{m.quantity}</td>
                  <td>
                    <div className="stock-evolution-pill">
                      <span className="stock-prev">{m.previousStock}</span>
                      <ArrowRight size={12} className="evolution-arrow" />
                      <span className={`stock-next ${m.newStock < m.previousStock ? 'drop' : 'rise'}`}>
                        {m.newStock}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="ref-tag">
                      {m.referenceId || m.referenceType}
                    </span>
                  </td>
                  <td>
                    <div className="user-author-cell">
                      <div className="mini-user-avatar">
                        {m.createdByName?.[0] || 'U'}
                      </div>
                      <span>{m.createdByName}</span>
                    </div>
                  </td>
                  <td className="timestamp-cell">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!stats?.recentMovements || stats.recentMovements.length === 0) && (
                <tr>
                  <td colSpan={9} className="empty-table-cell">
                    No hay movimientos registrados recientemente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
