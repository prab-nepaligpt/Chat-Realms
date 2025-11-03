import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { authApi, storage, type TokenResponse } from '../lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  token: TokenResponse | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (params: { name: string; email: string; password: string; description?: string | null }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<TokenResponse | null>(() => storage.getToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const t = await authApi.login(email, pass);
      storage.setToken(t);
      setToken(t);
      return true;
    } catch (e) {
      return false;
    }
  };

  const register = async (params: { name: string; email: string; password: string; description?: string | null }) => {
    await authApi.register(params);
    // Registration successful - user needs to login manually
  };

  const logout = () => {
    storage.clear();
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
