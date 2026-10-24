import React, { useState } from 'react';
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Warehouse,
  Boxes,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'admin' | 'seller' | 'warehouseman') => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(role);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-icon">
            <Boxes size={28} color="#ffffff" />
          </div>
          <h1 className="login-brand-title">StockFlow</h1>
          <p className="login-brand-subtitle">
            Sistema Empresarial de Gestión de Inventario, Compras y Ventas
          </p>
        </div>

        {/* Quick Demo Access Bar with Real SVG Icons */}
        <div className="login-quick-access-box">
          <div className="quick-access-title">
            <Sparkles size={12} className="quick-access-icon" />
            Acceso Rápido de Prueba (1-Clic)
          </div>

          <div className="quick-access-grid">
            <button
              type="button"
              onClick={() => handleQuick('admin')}
              className="quick-role-btn admin"
              disabled={loading}
              title="Iniciar como Administrador"
            >
              <ShieldCheck size={14} className="role-icon" />
              <div className="role-btn-texts">
                <span className="role-name">Admin</span>
                <span className="role-desc">Acceso Total</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuick('seller')}
              className="quick-role-btn seller"
              disabled={loading}
              title="Iniciar como Vendedor"
            >
              <ShoppingBag size={14} className="role-icon" />
              <div className="role-btn-texts">
                <span className="role-name">Vendedor</span>
                <span className="role-desc">POS & Ventas</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuick('warehouseman')}
              className="quick-role-btn warehouse"
              disabled={loading}
              title="Iniciar como Almacenero"
            >
              <Warehouse size={14} className="role-icon" />
              <div className="role-btn-texts">
                <span className="role-name">Almacén</span>
                <span className="role-desc">Kardex & Stock</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="login-error-alert">
            <span>{error}</span>
          </div>
        )}

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Usuario o Correo Institucional</label>
            <div className="input-with-icon">
              <User size={16} className="field-leading-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="ej. admin o admin@stockflow.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-leading-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                tabIndex={-1}
                aria-label="Ver contraseña"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              'Verificando credenciales...'
            ) : (
              <>
                Ingresar al Sistema <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Apple Style Minimalist Security Footer */}
        <div className="login-footer-stack">
          <div className="stack-item">
            <ShieldCheck size={12} />
            <span>Acceso Corporativo Seguro</span>
          </div>
          <span className="stack-sep">•</span>
          <span>StockFlow Enterprise</span>
        </div>
      </div>
    </div>
  );
};
