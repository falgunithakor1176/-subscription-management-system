/**
 * AuthLayout.jsx
 * Layout wrapper for authentication pages (Login, Register).
 * Matches the SubManage visual design system.
 */

import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Left hero / branding panel */}
        <div className="auth-hero">
          {/* Ambient background decoration */}
          <div className="auth-hero__ambient auth-hero__ambient--top" aria-hidden="true" />
          <div className="auth-hero__ambient auth-hero__ambient--bottom" aria-hidden="true" />

          <div className="auth-hero__content">
            {/* Brand Header */}
            <div className="auth-hero__brand">
              <svg
                width="34"
                height="34"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="auth-hero__logo-icon"
                aria-hidden="true"
              >
                {/* 3D Isometric Cube matching SubManage */}
                <path d="M16 2.8L28.2 9.5V22.5L16 29.2L3.8 22.5V9.5L16 2.8Z" fill="#EEF2FF" />
                <path d="M16 3.6L27 9.8L16 16.2L5 9.8L16 3.6Z" fill="#818CF8" />
                <path d="M5 10.6L15.4 16.6V28.2L5 22.2V10.6Z" fill="#6366F1" />
                <path d="M16.6 16.6L27 10.6V22.2L16.6 28.2V16.6Z" fill="#4F46E5" />
              </svg>
              <span className="auth-hero__brand-name">SubManage</span>
            </div>

            {/* Headline and descriptive text */}
            <div className="auth-hero__text">
              <h1 className="auth-hero__title">
                Subscription<br />Management System
              </h1>
              <p className="auth-hero__subtitle">
                Manage customers, subscriptions, invoices and payments in one place.
              </p>
            </div>

            {/* Illustration Graphic Card */}
            <div className="auth-hero__preview-card" aria-hidden="true">
              <div className="auth-preview">
                <div className="auth-preview__header">
                  <div className="auth-preview__pill" />
                  <div className="auth-preview__dot auth-preview__dot--1" />
                  <div className="auth-preview__dot auth-preview__dot--2" />
                </div>
                <div className="auth-preview__chart">
                  <div className="auth-preview__bar-group">
                    <div className="auth-preview__bar auth-preview__bar--1" />
                  </div>
                  <div className="auth-preview__bar-group">
                    <div className="auth-preview__bar auth-preview__bar--2" />
                  </div>
                  <div className="auth-preview__bar-group">
                    <div className="auth-preview__bar auth-preview__bar--3" />
                  </div>
                  <div className="auth-preview__bar-group">
                    <div className="auth-preview__bar auth-preview__bar--4" />
                  </div>
                  <div className="auth-preview__bar-group">
                    <div className="auth-preview__bar auth-preview__bar--5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
