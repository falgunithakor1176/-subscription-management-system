/**
 * LoginForm.jsx
 * Controlled login form with input icons, client validation, and SubManage design.
 */

import { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [values, setValues] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = (name, value) => {
    if (name === 'email') {
      if (!value.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address.';
    }
    if (name === 'password') {
      if (!value) return 'Password is required.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setValues((prev) => ({ ...prev, [name]: val }));
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, val) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};
    ['email', 'password'].forEach((key) => {
      const err = validate(key, values[key]);
      if (err) errors[key] = err;
    });

    setFieldErrors(errors);
    setTouched({ email: true, password: true });

    if (Object.keys(errors).length > 0) return;

    onSubmit({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
  };

  const DEMO_CREDENTIALS = [
    { role: 'Admin', email: 'admin@brightloop.com', password: 'Password@123', badge: 'badge--admin' },
    { role: 'Staff', email: 'staff@brightloop.com', password: 'Password@123', badge: 'badge--staff' },
    { role: 'Customer', email: 'customer@brightloop.com', password: 'Password@123', badge: 'badge--customer' },
  ];

  const handleQuickFill = (cred) => {
    setValues({
      email: cred.email,
      password: cred.password,
      rememberMe: false,
    });
    setFieldErrors({});
    setTouched({});
  };

  return (
    <form
      id="form-login"
      className="auth-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Login form"
    >
      {/* Role-Wise Demo Quick-Fill Bar */}
      <div className="demo-role-selector">
        <span className="demo-role-selector__label">Quick-Fill by Role:</span>
        <div className="demo-role-selector__buttons">
          {DEMO_CREDENTIALS.map((c) => (
            <button
              key={c.role}
              type="button"
              className={`demo-role-pill ${c.badge} ${values.email === c.email ? 'demo-role-pill--selected' : ''}`}
              onClick={() => handleQuickFill(c)}
              title={`Prefill ${c.role} credentials`}
            >
              {c.role}
            </button>
          ))}
        </div>
      </div>

      {/* Global alert error */}
      {error && (
        <div className="auth-form__alert auth-form__alert--error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {/* Email address */}
      <div className={`form-group ${fieldErrors.email && touched.email ? 'form-group--error' : ''}`}>
        <label htmlFor="login-email" className="form-label">
          Email address
        </label>
        <div className="form-input-box">
          <Mail className="form-input-icon form-input-icon--lead" size={18} aria-hidden="true" />
          <input
            id="login-email"
            type="email"
            name="email"
            className="form-input form-input--has-lead"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your email"
            autoComplete="email"
            disabled={isLoading}
            aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
            aria-invalid={Boolean(fieldErrors.email && touched.email)}
          />
        </div>
        {fieldErrors.email && touched.email && (
          <p id="login-email-error" className="form-error" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className={`form-group ${fieldErrors.password && touched.password ? 'form-group--error' : ''}`}>
        <label htmlFor="login-password" className="form-label">
          Password
        </label>
        <div className="form-input-box">
          <Lock className="form-input-icon form-input-icon--lead" size={18} aria-hidden="true" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            className="form-input form-input--has-lead form-input--has-trail"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isLoading}
            aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
            aria-invalid={Boolean(fieldErrors.password && touched.password)}
          />
          <button
            type="button"
            id="btn-toggle-password-login"
            className="form-input-icon-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password && touched.password && (
          <p id="login-password-error" className="form-error" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Remember me & Forgot password row */}
      <div className="form-options-row">
        <label className="form-checkbox-label">
          <input
            type="checkbox"
            name="rememberMe"
            checked={values.rememberMe}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>Remember me</span>
        </label>

        <a
          href="#forgot-password"
          className="form-link"
          onClick={(e) => {
            e.preventDefault();
            alert('Password reset link has been dispatched if this email exists.');
          }}
        >
          Forgot password?
        </a>
      </div>

      {/* Submit button */}
      <button
        id="btn-login-submit"
        type="submit"
        className="btn btn--primary btn--full btn--lg"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="spin" aria-hidden="true" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
