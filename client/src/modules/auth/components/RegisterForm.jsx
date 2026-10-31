/**
 * RegisterForm.jsx
 * Controlled registration form with input icons, real-time validation, and SubManage design.
 */

import { useState } from 'react';
import { Eye, EyeOff, Info, Loader2, Lock, Mail, User } from 'lucide-react';

const RegisterForm = ({ onSubmit, isLoading, error }) => {
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = (name, value) => {
    if (name === 'fullName') {
      if (!value.trim()) return 'Full name is required.';
      if (value.trim().length > 100) return 'Full name must not exceed 100 characters.';
    }
    if (name === 'email') {
      if (!value.trim()) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Enter a valid email address.';
    }
    if (name === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter.';
      if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter.';
      if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain a special character.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
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
    ['fullName', 'email', 'password'].forEach((key) => {
      const err = validate(key, values[key]);
      if (err) errors[key] = err;
    });

    setFieldErrors(errors);
    setTouched({ fullName: true, email: true, password: true });

    if (Object.keys(errors).length > 0) return;

    // Split Full Name into firstName and lastName for backend compatibility
    const nameParts = values.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const payload = {
      firstName,
      lastName,
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    onSubmit(payload);
  };

  const isFieldError = (name) => Boolean(fieldErrors[name] && touched[name]);

  return (
    <form
      id="form-register"
      className="auth-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Registration form"
    >
      {/* Global alert error */}
      {error && (
        <div className="auth-form__alert auth-form__alert--error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      {/* Full name */}
      <div className={`form-group ${isFieldError('fullName') ? 'form-group--error' : ''}`}>
        <label htmlFor="register-fullName" className="form-label">
          Full name
        </label>
        <div className="form-input-box">
          <User className="form-input-icon form-input-icon--lead" size={18} aria-hidden="true" />
          <input
            id="register-fullName"
            type="text"
            name="fullName"
            className="form-input form-input--has-lead"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your full name"
            autoComplete="name"
            disabled={isLoading}
            aria-invalid={isFieldError('fullName')}
            aria-describedby={isFieldError('fullName') ? 'register-fullName-error' : undefined}
          />
        </div>
        {isFieldError('fullName') && (
          <p id="register-fullName-error" className="form-error" role="alert">
            {fieldErrors.fullName}
          </p>
        )}
      </div>

      {/* Email address */}
      <div className={`form-group ${isFieldError('email') ? 'form-group--error' : ''}`}>
        <label htmlFor="register-email" className="form-label">
          Email address
        </label>
        <div className="form-input-box">
          <Mail className="form-input-icon form-input-icon--lead" size={18} aria-hidden="true" />
          <input
            id="register-email"
            type="email"
            name="email"
            className="form-input form-input--has-lead"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your email"
            autoComplete="email"
            disabled={isLoading}
            aria-invalid={isFieldError('email')}
            aria-describedby={isFieldError('email') ? 'register-email-error' : undefined}
          />
        </div>
        {isFieldError('email') && (
          <p id="register-email-error" className="form-error" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className={`form-group ${isFieldError('password') ? 'form-group--error' : ''}`}>
        <label htmlFor="register-password" className="form-label">
          Password
        </label>
        <div className="form-input-box">
          <Lock className="form-input-icon form-input-icon--lead" size={18} aria-hidden="true" />
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            className="form-input form-input--has-lead form-input--has-trail"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Create a strong password"
            autoComplete="new-password"
            disabled={isLoading}
            aria-invalid={isFieldError('password')}
            aria-describedby="password-hint"
          />
          <button
            type="button"
            id="btn-toggle-password-register"
            className="form-input-icon-btn"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Requirements hint matching mockup */}
        <div id="password-hint" className="form-input-hint">
          <Info size={14} className="form-input-hint__icon" aria-hidden="true" />
          <span>Minimum 8 characters, with uppercase, lowercase and a special character</span>
        </div>

        {isFieldError('password') && (
          <p id="register-password-error" className="form-error" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        id="btn-register-submit"
        type="submit"
        className="btn btn--primary btn--full btn--lg"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="spin" aria-hidden="true" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </button>
    </form>
  );
};

export default RegisterForm;
