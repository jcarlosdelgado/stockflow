import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/client';
import { Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isWarehouseman: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  quickLogin: (role: 'admin' | 'seller' | 'warehouseman') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('stockflow_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('stockflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          localStorage.setItem('stockflow_user', JSON.stringify(profile));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();

    const handleLogout = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('stockflow_logout', handleLogout);
    return () => window.removeEventListener('stockflow_logout', handleLogout);
  }, [token]);

  const login = async (usernameOrEmail: string, password: string) => {
    const response = await authApi.login(usernameOrEmail, password);
    setToken(response.token);
    localStorage.setItem('stockflow_token', response.token);

    const currentUser: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      role: response.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setUser(currentUser);
    localStorage.setItem('stockflow_user', JSON.stringify(currentUser));
  };

  const quickLogin = async (role: 'admin' | 'seller' | 'warehouseman') => {
    if (role === 'admin') {
      await login('admin', 'admin123');
    } else if (role === 'seller') {
      await login('vendedor', 'vendedor123');
    } else {
      await login('almacenero', 'almacenero123');
    }
  };

  const logout = () => {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
    setToken(null);
    setUser(null);
  };

  const role: Role | undefined = user?.role;
  const isAdmin = role === 'ROLE_ADMIN';
  const isSeller = role === 'ROLE_SELLER';
  const isWarehouseman = role === 'ROLE_WAREHOUSEMAN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isSeller,
        isWarehouseman,
        login,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
