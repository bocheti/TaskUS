import { createContext, useState, ReactNode } from 'react';
import { User, LoginCredentials } from '@/types';
import { userService } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  setAuthData: (token: string, user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });

  const login = async (credentials: LoginCredentials) => {
    const response = await userService.login(credentials);
    setToken(response.authToken);
    setUser(response.userInfo);
    localStorage.setItem('authToken', response.authToken);
    localStorage.setItem('user', JSON.stringify(response.userInfo));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

   const setAuthData = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading: false,
        login,
        logout,
        updateUser,
        setAuthData, // ← Add this
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};