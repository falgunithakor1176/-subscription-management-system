/**
 * RegisterPage.jsx
 * Authentication page for new user registration matching SubManage design.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import RegisterForm from '../components/RegisterForm.jsx';

const RegisterPage = () => {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      await register(data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Unable to create account. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-content">
      <div className="auth-header">
        <h2 className="auth-header__title">Create an account</h2>
        <p className="auth-header__subtitle">Get started with your subscription system</p>
      </div>

      <RegisterForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />

      <div className="auth-footer-prompt">
        <span>Already have an account? </span>
        <Link id="link-to-login" to="/login" className="auth-footer-link">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
