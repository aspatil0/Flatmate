import React, { createContext, useState, useContext, useEffect } from 'react';
import { pgOwnerAPI } from '../lib/api';

const PGOwnerAuthContext = createContext();

export const PGOwnerAuthProvider = ({ children }) => {
  const [pgOwner, setPGOwner] = useState(null);
  const [pgOwnerToken, setPGOwnerToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('pgOwnerToken');
    const savedPGOwner = localStorage.getItem('pgOwner');

    if (savedToken && savedPGOwner) {
      setPGOwnerToken(savedToken);
      setPGOwner(JSON.parse(savedPGOwner));
    }
    setLoading(false);
  }, []);

  const registerPGOwner = async (name, email, password, phone, companyName, location) => {
    try {
      setError(null);
      setLoading(true);
      const response = await pgOwnerAPI.register(name, email, password, phone, companyName, location);

      setPGOwnerToken(response.token);
      setPGOwner(response.pgOwner);
      localStorage.setItem('pgOwnerToken', response.token);
      localStorage.setItem('pgOwner', JSON.stringify(response.pgOwner));

      return response;
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginPGOwner = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await pgOwnerAPI.login(email, password);

      setPGOwnerToken(response.token);
      setPGOwner(response.pgOwner);
      localStorage.setItem('pgOwnerToken', response.token);
      localStorage.setItem('pgOwner', JSON.stringify(response.pgOwner));

      return response;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logoutPGOwner = () => {
    setPGOwner(null);
    setPGOwnerToken(null);
    localStorage.removeItem('pgOwnerToken');
    localStorage.removeItem('pgOwner');
  };

  return (
    <PGOwnerAuthContext.Provider
      value={{
        pgOwner,
        pgOwnerToken,
        loading,
        error,
        registerPGOwner,
        loginPGOwner,
        logoutPGOwner,
      }}
    >
      {children}
    </PGOwnerAuthContext.Provider>
  );
};

export const usePGOwnerAuth = () => {
  const context = useContext(PGOwnerAuthContext);
  if (!context) {
    throw new Error('usePGOwnerAuth must be used within PGOwnerAuthProvider');
  }
  return context;
};
