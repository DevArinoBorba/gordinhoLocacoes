'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppShell({ children, name }: { children: React.ReactNode; name: string }) {
  const path = usePathname();
  if (path === '/' || path === '/login' || path === '/loja' || path.startsWith('/loja/')) {
    return <div className="public-shell">{children}</div>;
  }
  return (
    <>
      <aside>
        <Link className="logo" href="/admin">
          G<span>●</span>
        </Link>
        <strong>{name}</strong>
        <small>Gestão de locações</small>
        <nav>
          <Link href="/admin" className={path === '/admin' ? 'active' : ''}>
            Equipamentos
          </Link>
          <Link href="/admin/unidades" className={path === '/admin/unidades' ? 'active' : ''}>
            Unidades Físicas
          </Link>
          <Link href="/admin/banners" className={path === '/admin/banners' ? 'active' : ''}>
            Banners do Topo
          </Link>
          <Link href="/admin/aviso" className={path === '/admin/aviso' ? 'active' : ''}>
            Aviso do Topo
          </Link>
          <Link href="/admin/cadastros" className={path === '/admin/cadastros' ? 'active' : ''}>
            + Novo Cadastro
          </Link>
          <Link href="/calendario" className={path === '/calendario' ? 'active' : ''}>
            Disponibilidade
          </Link>
          <Link href="/reservas" className={path.startsWith('/reservas') && path !== '/reservas/nova' ? 'active' : ''}>
            Reservas
          </Link>
          <Link href="/reservas/nova" className={`nav-cta ${path === '/reservas/nova' ? 'active' : ''}`}>
            + Nova reserva
          </Link>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            Ver site da loja ↗
          </Link>
        </nav>
        <footer>Horário de Brasília</footer>
      </aside>
      <main>
        <header>
          <span>PAINEL ADMINISTRATIVO</span>
          <span className="badge">Gestão da locadora</span>
        </header>
        {children}
      </main>
    </>
  );
}
