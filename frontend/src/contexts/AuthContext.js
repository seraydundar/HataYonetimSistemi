// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // is_superuser değerine göre role bilgisini belirleyin
      return {
        ...parsedUser,
        role: parsedUser.is_superuser ? 'admin' : 'user'
      };
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      // Her güncellemede role bilgisini is_superuser üzerinden hesaplayarak kaydet
      const normalizedUser = {
        ...user,
        role: user.is_superuser ? 'admin' : 'user'
      };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
