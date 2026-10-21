'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LoginFormProps {
  erro?: string;
}

export function LoginForm({ erro }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="login-form-panel">
      <div className="form-header">
        <h2 className="form-title">Acesso ao Painel</h2>
        <p className="form-description">
          Identifique-se com suas credenciais para gerenciar equipamentos e locações.
        </p>
      </div>

      {erro && (
        <div role="alert" className="login-alert">
          <svg
            className="login-alert-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            {erro === 'limite' ? (
              <span>
                <strong>Limite de tentativas excedido.</strong> Por segurança, aguarde 10 minutos para tentar novamente.
              </span>
            ) : (
              <span>
                <strong>Credenciais inválidas.</strong> Verifique o usuário e a senha informados.
              </span>
            )}
          </div>
        </div>
      )}

      <form
        action="/api/login"
        method="post"
        className="login-form"
        onSubmit={() => setIsSubmitting(true)}
      >
        <div className="form-group">
          <label htmlFor="login-user" className="form-label">
            <span>Usuário</span>
          </label>
          <div className="input-wrapper">
            <span className="input-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              id="login-user"
              name="user"
              type="text"
              autoComplete="username"
              required
              maxLength={100}
              placeholder="Digite seu usuário"
              className="login-input"
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="login-password" className="form-label">
            <span>Senha de Acesso</span>
          </label>
          <div className="input-wrapper">
            <span className="input-icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              maxLength={256}
              placeholder="Digite sua senha"
              className="login-input has-toggle"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="login-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <span>Entrar no painel</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="form-footer">
        <Link href="/" className="store-catalog-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Ir para o catálogo público (Loja)</span>
        </Link>

        <div className="security-badge">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Ambiente administrativo seguro • Horário de Brasília</span>
        </div>
      </div>
    </div>
  );
}
