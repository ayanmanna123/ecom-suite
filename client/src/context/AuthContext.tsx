import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCredentials, setLoading as setReduxLoading, logout as reduxLogout } from '../store/slices/authSlice';

interface User {
  _id: string;
  email: string;
  name?: string;
  picture?: string;
  role: 'customer' | 'seller';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: 'customer' | 'seller') => Promise<void>;
  googleLogin: (idToken: string) => Promise<{ isNew: boolean }>;
  updateRole: (role: 'customer' | 'seller') => Promise<void>;
  signOut: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Redux Persist handles initial loading from storage
    // We just need to make sure loading is false once hydrated
    // Since we're using PersistGate, the app won't render until hydrated
    dispatch(setReduxLoading(false));
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    
    dispatch(setCredentials({ user: data.user, token: data.token }));
  };

  const register = async (email: string, password: string, name: string, role: 'customer' | 'seller' = 'customer') => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    
    dispatch(setCredentials({ user: data.user, token: data.token }));
  };

  const googleLogin = async (idToken: string) => {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Google login failed');
    
    dispatch(setCredentials({ user: data.user, token: data.token }));
    return { isNew: data.isNew };
  };

  const updateRole = async (role: 'customer' | 'seller') => {
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_URL}/auth/role`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update role');
    
    dispatch(setCredentials({ user: data, token }));
  };

  const signOut = () => {
    dispatch(reduxLogout());
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, updateRole, signOut }}>
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
