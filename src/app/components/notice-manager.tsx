'use client';
import { useState, useActionState } from 'react';
import { updateStoreNotice, type ActionState } from '../actions';
import type { StoreNotice } from '@/lib/queries';

const initial: ActionState = { ok: false, message: '' };

export function NoticeManager({ notice }: { notice: StoreNotice }) {
  const [state, action, pending] = useActionState(updateStoreNotice, initial);

  // Local state for live preview
  const [enabled, setEnabled] = useState(notice.enabled);
  const [message, setMessage] = useState(notice.message);
  const [badgeText, setBadgeText] = useState(notice.badge_text || 'AVISO');
  const [variant, setVariant] = useState(notice.variant || 'warning');
  const [animated, setAnimated] = useState(notice.animated ?? true);
  const [linkUrl, setLinkUrl] = useState(notice.link_url || '');
  const [linkText, setLinkText] = useState(notice.link_text || '');

  return (
    <div className="notice-manager-page">
      {/* Live Preview Card */}
      <section className="panel" style={{ background: '#0a2717', borderColor: '#366047', color: '#fff', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <strong style={{ fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', color: '#fab818' }}>
            Prévia em Tempo Real (Como aparece no topo da loja)
          </strong>
          <span className="badge" style={{ background: enabled ? '#dcf2e6' : '#fae1dd', color: '#18282d', fontWeight: 'bold' }}>
            {enabled ? '● Ativo no site' : '○ Oculto no site'}
          </span>
        </div>

        {enabled ? (
          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(250,184,24,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div
              className={`store-notice-bar ${variant} ${animated ? 'is-animated' : ''}`}
              style={{ margin: 0 }}
            >
              <div className="store-notice-inner">
                {badgeText && (
                  <span className="notice-badge">
                    <span className="notice-badge-dot" />
                    {badgeText}
                  </span>
                )}
                <span className="notice-message">{message || 'Digite a mensagem do aviso...'}</span>
                {linkUrl && (
                  <span className="notice-link-btn">
                    {linkText || 'Saiba mais'} <span className="notice-arrow">→</span>
                  </span>
                )}
              </div>
              {animated && <div className="notice-shine" />}
            </div>
          </div>
        ) : (
          <div className="empty" style={{ borderColor: '#366047', color: '#8fb49c' }}>
            O aviso está desativado. Nenhum card será exibido no topo da loja.
          </div>
        )}
      </section>

      {/* Form Section */}
      <form action={action} className="panel" style={{ marginTop: '24px' }}>
        <h2 style={{ marginTop: 0 }}>Configurações do Card de Aviso</h2>
        <p className="muted" style={{ fontSize: '13px', marginTop: '4px' }}>
          Personalize a mensagem, cores, links e os efeitos de animação exibidos na barra superior da loja.
        </p>

        {state.message && (
          <div role="status" className={state.ok ? 'success' : 'error'} style={{ margin: '18px 0' }}>
            {state.message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', margin: '20px 0' }}>
          <label className="checkbox" style={{ background: '#f4f6f3', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #dde4e1', display: 'flex', gap: '12px' }}>
            <input
              type="checkbox"
              name="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <div>
              <strong>Exibir aviso no site</strong>
              <small style={{ display: 'block', color: 'var(--muted)', fontWeight: 'normal' }}>
                Marque para ativar a exibição no topo de todas as páginas da loja.
              </small>
            </div>
          </label>

          <label className="checkbox" style={{ background: '#f4f6f3', padding: '14px 18px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #dde4e1', display: 'flex', gap: '12px' }}>
            <input
              type="checkbox"
              name="animated"
              checked={animated}
              onChange={(e) => setAnimated(e.target.checked)}
            />
            <div>
              <strong>Ativar animações no card</strong>
              <small style={{ display: 'block', color: 'var(--muted)', fontWeight: 'normal' }}>
                Efeito de brilho cintilante passando pelo card e pulso contínuo no selo.
              </small>
            </div>
          </label>
        </div>

        <label>
          Mensagem Principal do Card *
          <textarea
            name="message"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Catálogo de demonstração · valores e condições sujeitos à confirmação"
            required
          />
        </label>

        <div className="grid">
          <label>
            Texto do Selo / Badge
            <input
              name="badgeText"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Ex: DEMONSTRAÇÃO, AVISO, PROMOÇÃO, NOVIDADE"
            />
          </label>

          <label>
            Estilo Visual (Cores)
            <select
              name="variant"
              value={variant}
              onChange={(e) => setVariant(e.target.value as any)}
            >
              <option value="warning">Dourado Oficial (Amarelo / Verde Escuro)</option>
              <option value="promo">Promoção Intensa (Dourado Brilhante & Alto Destaque)</option>
              <option value="info">Verde Escuro Institucional (Texto Dourado)</option>
              <option value="success">Verde Sucesso / Novidade</option>
            </select>
          </label>
        </div>

        <div className="grid">
          <label>
            Link de Destino (Opcional)
            <input
              name="linkUrl"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Ex: #equipamentos ou https://wa.me/55..."
            />
            <small style={{ color: 'var(--muted)', fontWeight: 'normal' }}>
              Se preenchido, o card se tornará clicável levando para a página ou WhatsApp.
            </small>
          </label>

          <label>
            Texto do Botão / Link (Opcional)
            <input
              name="linkText"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Ex: Ver catálogo, Fale conosco, Saiba mais"
            />
          </label>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button type="submit" disabled={pending}>
            {pending ? 'Salvando alterações...' : 'Salvar Alterações no Aviso'}
          </button>
          {state.ok && <span style={{ color: '#14603e', fontSize: '13px', fontWeight: 'bold' }}>✓ Alterações salvas no banco de dados</span>}
        </div>
      </form>
    </div>
  );
}
