/**
 * LoginPage.jsx
 * Authentication page for login matching SubManage design.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import LoginForm from '../components/LoginForm.jsx';

const LoginPage = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (credentials) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await login(credentials);
      const role = response?.data?.user?.role;

      // Role-wise destination after sign in
      if (role === 'ADMIN') {
        navigate('/admin/users', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Unable to sign in. Please check your credentials and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2 className="auth-header__title">Welcome back</h2>
        <p className="auth-header__subtitle">Sign in to your account</p>
      </div>

      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />

      <div className="auth-footer-prompt">
        <span>Don't have an account? </span>
        <Link id="link-to-register" to="/register" className="auth-footer-link">
          Create account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
