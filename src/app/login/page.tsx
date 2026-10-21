import Image from 'next/image';
import { brand } from '@/config/brand';
import { LoginForm } from './login-form';
import './login.css';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div role="main" className="login-viewport">
      <div className="login-card">
        <section className="login-brand-panel" aria-label="Apresentação da Locadora">
          <div className="brand-header">
            <div className="mascot-container">
              <Image
                src="/brand/gordinho-mascot.png"
                alt={brand.name}
                width={96}
                height={96}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1 className="brand-title">{brand.name}</h1>
            <p className="brand-tagline">{brand.tagline}</p>
          </div>

          <ul className="brand-features" aria-label="Recursos do sistema">
            <li className="brand-feature-item">
              <span className="feature-icon-box" aria-hidden="true">
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
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </span>
              <span>Controle de frotas e disponibilidade</span>
            </li>
            <li className="brand-feature-item">
              <span className="feature-icon-box" aria-hidden="true">
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </span>
              <span>Contratos, caução e emissão de recibos</span>
            </li>
            <li className="brand-feature-item">
              <span className="feature-icon-box" aria-hidden="true">
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              <span>Calendário e reservas integradas</span>
            </li>
          </ul>

          <div className="brand-footer">
            <span>Gestão de Locações • Versão Operacional</span>
          </div>
        </section>

        <LoginForm erro={erro} />
      </div>
    </div>
  );
}
