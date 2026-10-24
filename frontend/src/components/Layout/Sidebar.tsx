import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowLeftRight,
  ShoppingCart,
  Truck,
  Users,
  Boxes,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ElementType;
    visible: boolean;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, isAdmin, isSeller, isWarehouseman } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: true },
      ],
    },
    {
      title: 'Inventario',
      items: [
        { id: 'products', label: 'Catálogo de Productos', icon: Package, visible: true },
        { id: 'warehouses', label: 'Red de Almacenes', icon: Warehouse, visible: true },
        { id: 'inventory', label: 'Control & Kardex', icon: ArrowLeftRight, visible: true },
      ],
    },
    {
      title: 'Operaciones',
      items: [
        { id: 'sales', label: 'Punto de Venta (POS)', icon: ShoppingCart, visible: isAdmin || isSeller },
        { id: 'purchases', label: 'Compras & Proveedores', icon: Truck, visible: isAdmin || isWarehouseman },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { id: 'users', label: 'Usuarios & Accesos', icon: Users, visible: isAdmin },
      ],
    },
  ];

  return (
    <aside className={`custom-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sleek Minimalist Brand */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <Boxes size={20} />
          </div>
          {!isCollapsed && (
            <span className="brand-name">StockFlow</span>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-collapse-btn"
          title={isCollapsed ? 'Expandir' : 'Colapsar'}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="sidebar-nav-container">
        {sections.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => item.visible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="nav-section-group">
              {!isCollapsed && (
                <div className="nav-section-header">
                  <span>{section.title}</span>
                </div>
              )}
              {isCollapsed && <div className="nav-section-divider-compact" />}

              <div className="nav-items-list">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`nav-item-btn ${active ? 'active' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className={`nav-icon-wrapper ${active ? 'active-icon' : ''}`}>
                        <Icon size={17} />
                      </div>

                      {!isCollapsed && (
                        <span className="nav-item-label">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Clean User Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar-initials">
            {user?.firstName?.[0] || 'U'}
          </div>

          {!isCollapsed && (
            <div className="user-meta-block">
              <span className="user-full-name">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="user-role-label">
                {user?.role === 'ROLE_ADMIN' ? 'Administrador' : user?.role === 'ROLE_SELLER' ? 'Vendedor' : 'Almacenero'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
