import React from 'react';
import { Search, Command, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentTab: string;
  onOpenCommand?: () => void;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Catálogo de Productos',
  warehouses: 'Red de Almacenes',
  inventory: 'Control & Kardex',
  sales: 'Punto de Venta (POS)',
  purchases: 'Compras & Proveedores',
  users: 'Usuarios & Accesos',
};

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenCommand }) => {
  const { user, logout } = useAuth();
  const pageTitle = TAB_TITLES[currentTab] || 'StockFlow';

  return (
    <header className="custom-header">
      {/* Page Title: Minimal Apple Typography */}
      <div className="header-title-block">
        <h1 className="header-page-title">{pageTitle}</h1>
      </div>

      {/* Right Side: Compact Search + Clean User & Logout */}
      <div className="header-actions-block">
        {/* Compact Search Trigger */}
        <button
          onClick={onOpenCommand}
          className="header-search-bar"
          title="Buscar en todo el sistema (Ctrl+K)"
          aria-label="Buscador rápido"
        >
          <Search size={13} className="search-icon" />
          <span className="search-placeholder">Buscar...</span>
          <span className="search-kbd-shortcut">
            <Command size={10} />K
          </span>
        </button>

        {/* User Capsule & Refined Black Logout Button */}
        <div className="header-user-logout-group">
          <div className="header-user-capsule" title={`Conectado como ${user?.username}`}>
            <div className="header-user-avatar">
              {user?.firstName?.[0] || 'U'}
            </div>
            <span className="header-user-name">
              {user?.firstName} {user?.lastName}
            </span>
          </div>

          <button
            onClick={logout}
            className="header-logout-pill-btn"
            title="Cerrar sesión segura"
            aria-label="Cerrar sesión"
          >
            <LogOut size={13} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};
