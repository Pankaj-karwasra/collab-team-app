import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../api/axios';

interface AuthContextType {
  user: User | null; // Firebase User
  mongoUser: any;    // MongoDB User (has role, teamId)
  loading: boolean;
  refreshUser: () => Promise<void>; // To reload user data after team creation
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, mongoUser: null, loading: true, refreshUser: async () => {} 
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mongoUser, setMongoUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMongoUser = async () => {
    try {
      const { data } = await api.get('/users/me');
      setMongoUser(data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchMongoUser();
      } else {
        setMongoUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, mongoUser, loading, refreshUser: fetchMongoUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};