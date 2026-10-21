import Link from 'next/link';
import Image from 'next/image';
import localFont from 'next/font/local';
import type { CSSProperties } from 'react';
import { brand } from '@/config/brand';
import { storeBrand } from '@/config/store-brand';
import { getStoreNotice } from '@/lib/queries';
import { StoreNoticeBar } from '@/app/components/store-notice-bar';
import './store.css';
import './identity.css';

const outfit = localFont({
  src: '../../assets/fonts/outfit.woff2',
  weight: '400 900',
  variable: '--store-heading',
  display: 'swap',
});
const jakarta = localFont({
  src: '../../assets/fonts/jakarta.woff2',
  weight: '400 800',
  variable: '--store-body',
  display: 'swap',
});

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const notice = await getStoreNotice();

  return (
    <div
      className={`store-theme ${outfit.variable} ${jakarta.variable}`}
      style={
        {
          '--store-primary': storeBrand.primary,
          '--store-background': storeBrand.background,
          '--store-surface': storeBrand.surface,
        } as CSSProperties
      }
    >
      <StoreNoticeBar notice={notice} />
      <div className="store-header">
        <div className="store-nav">
          <Link className="store-logo" href="/" aria-label={`${brand.name} — início`}>
            <Image
              className="store-mascot"
              src={storeBrand.mascot}
              width={64}
              height={64}
              alt="Mascote Gordinho"
              unoptimized
            />
            <span>
              {brand.name.replace(/\s+Locações$/i, '').toLocaleUpperCase('pt-BR')}
              <small>{storeBrand.subtitle}</small>
            </span>
          </Link>
          <form className="header-search" action="/#equipamentos">
            <label className="sr-only" htmlFor="header-search">
              O que você está procurando?
            </label>
            <input id="header-search" name="q" placeholder="O que você está procurando?" />
            <button aria-label="Buscar equipamentos">⌕</button>
          </form>
          <Link className="header-reserve" href="/#equipamentos">
            <span aria-hidden="true">▦</span> Consultar disponibilidade
          </Link>
        </div>
      </div>
      <nav className="store-menu" aria-label="Navegação da locadora">
        <div>
          <Link href="/">⌂ Início</Link>
          <Link href="/#equipamentos">▦ Equipamentos</Link>
          <Link href="/#como-funciona">Como alugar</Link>
          <Link href="/#atendimento">Atendimento</Link>
        </div>
      </nav>
      {children}
      <section className="store-service-strip">
        <div>
          <strong>POR DIÁRIA</strong>
          <span>Escolha seu período</span>
        </div>
        <div>
          <strong>DISPONIBILIDADE</strong>
          <span>Consulta por data e horário</span>
        </div>
        <div>
          <strong>SEM COBRANÇA ONLINE</strong>
          <span>Confirme com a equipe</span>
        </div>
        <div>
          <strong>ATENDIMENTO PRÓXIMO</strong>
          <span>Detalhes antes da confirmação</span>
        </div>
      </section>
      <div className="store-footer" id="atendimento">
        <div className="store-footer-content">
          <div>
            <strong>{brand.name}</strong>
            <p>
              Da sua obra ao seu evento.<br />
              O equipamento certo para fazer acontecer.
            </p>
          </div>
          <div>
            <strong>Explore o catálogo</strong>
            <p>
              <Link href="/#equipamentos">Equipamentos e preços</Link><br />
              <Link href="/#como-funciona">Como alugar</Link>
            </p>
          </div>
          <div>
            <strong>Vamos planejar sua locação?</strong>
            <p>
              Informe o período e solicite sua reserva.<br />
              A equipe entra em contato pelo telefone informado.
            </p>
            <Link className="store-button" href="/#equipamentos">
              Escolher equipamento ↗
            </Link>
          </div>
        </div>
        <div>
          <span>© {new Date().getFullYear()} {brand.name} · Horário de Brasília</span>
          <Link href="/admin">Área da equipe</Link>
        </div>
      </div>
    </div>
  );
}
