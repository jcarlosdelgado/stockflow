import React, { useEffect, useState } from 'react';
import { Users as UsersIcon, Shield, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { usersApi } from '../api/client';
import { Role, User } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      await usersApi.toggleStatus(user.id, !user.isActive);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error al modificar estado de la cuenta');
    }
  };

  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      await usersApi.updateRole(userId, newRole);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar rol');
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="badge badge-info">Administrador</span>;
      case 'ROLE_SELLER':
        return <span className="badge badge-success">Vendedor</span>;
      case 'ROLE_WAREHOUSEMAN':
        return <span className="badge badge-warning">Almacenero</span>;
      default:
        return <span className="badge">{role}</span>;
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Gestión de Usuarios & Control de Accesos</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Administre credenciales, roles y permisos del personal corporativo
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre y Apellido</th>
              <th>Usuario</th>
              <th>Correo Electrónico</th>
              <th>Rol Asignado</th>
              <th>Estado de Cuenta</th>
              <th>Fecha Registro</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>#{u.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#000000',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.825rem',
                      flexShrink: 0
                    }}>
                      {u.firstName?.[0] || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>@{u.username}</td>
                <td>
                  {getRoleBadge(u.role)}
                </td>
                <td>
                  <select
                    className="form-select"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto', borderRadius: 'var(--radius-full)' }}
                  >
                    <option value="ROLE_ADMIN">Administrador</option>
                    <option value="ROLE_SELLER">Vendedor</option>
                    <option value="ROLE_WAREHOUSEMAN">Almacenero</option>
                  </select>
                </td>
                <td>
                  {u.isActive ? (
                    <span className="badge badge-success">Activa</span>
                  ) : (
                    <span className="badge badge-danger">Inactiva</span>
                  )}
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      color: u.isActive ? 'var(--danger)' : 'var(--success)',
                      borderColor: u.isActive ? 'var(--danger-border)' : 'var(--success-border)'
                    }}
                  >
                    {u.isActive ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
