/**
 * useAuth.js
 * Custom hook for consuming the AuthContext.
 * Throws an error if used outside of AuthProvider.
 */

import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext.jsx';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
};
