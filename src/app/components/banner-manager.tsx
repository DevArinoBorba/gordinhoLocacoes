'use client';
import { useActionState } from 'react';
import Image from 'next/image';
import { addBanner, toggleBanner, deleteBanner, type ActionState } from '../actions';
import type { Banner } from '@/lib/queries';

const initial: ActionState = { ok: false, message: '' };

function Message({ state }: { state: ActionState }) {
  return state.message ? (
    <p role="status" className={state.ok ? 'success' : 'error'}>
      {state.message}
    </p>
  ) : null;
}

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [addState, addAction, addPending] = useActionState(addBanner, initial);

  return (
    <div className="banner-manager-section" id="banners">
      <div className="section-title">
        <div>
          <h2>Banners do Topo da Loja</h2>
          <p className="muted" style={{ margin: '4px 0 0', fontSize: '13px' }}>
            Quando houver mais de um banner ativo, eles ficam alternando automaticamente na página inicial do site.
          </p>
        </div>
        <span className="badge" style={{ background: '#f6bc28', color: '#18282d', fontWeight: 'bold' }}>
          {banners.filter((b) => b.active).length} de {banners.length} ativos
        </span>
      </div>

      {banners.length === 0 ? (
        <div className="empty" style={{ margin: '18px 0' }}>
          Nenhum banner cadastrado ainda. O site está exibindo o banner padrão da locadora.
        </div>
      ) : (
        <div className="banner-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', margin: '20px 0 35px' }}>
          {banners.map((b) => (
            <article
              key={b.id}
              className="panel"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                border: b.active ? '1px solid #366047' : '1px dashed #cbd6d1',
                opacity: b.active ? 1 : 0.75,
              }}
            >
              <div
                style={{
                  height: 160,
                  background: '#06180e',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                {b.image_filename ? (
                  <Image
                    src={`/loja/imagens/${b.image_filename}`}
                    alt={b.title}
                    width={320}
                    height={160}
                    unoptimized
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: '#fab818', fontSize: '12px', fontWeight: 'bold' }}>
                    Sem imagem (usa mascote)
                  </span>
                )}
                {b.badge_text && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: '#fab818',
                      color: '#06180e',
                      fontSize: '9px',
                      fontWeight: 900,
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {b.badge_text.replace(/\n/g, ' ')}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="eyebrow" style={{ fontSize: '10px', color: '#166534' }}>
                  {b.eyebrow || 'DESTAQUE'}
                </span>
                <span className={`badge ${b.active ? 'confirmed' : 'cancelled'}`} style={{ fontSize: '10px' }}>
                  {b.active ? '● Ativo na Loja' : '○ Pausado'}
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: '17px' }}>{b.title}</h3>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 12px', flex: 1 }}>
                {b.subtitle || 'Sem descrição.'}
              </p>

              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '16px', background: '#f4f6f3', padding: '8px 10px', borderRadius: '6px' }}>
                <div><strong>Botão:</strong> {b.link_text}</div>
                <div><strong>Destino:</strong> <code>{b.link_url}</code></div>
                <div><strong>Ordem:</strong> #{b.sort_order}</div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                <BannerToggleButton id={b.id} active={b.active} />
                <BannerDeleteButton id={b.id} />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="panel" style={{ background: '#fff' }}>
        <h3 style={{ margin: '0 0 16px' }}>+ Criar Novo Banner</h3>
        <form action={addAction}>
          <div className="grid">
            <label>
              Título do Banner *
              <input
                name="title"
                required
                minLength={2}
                maxLength={150}
                placeholder="Ex.: ÁUDIO, VÍDEO & PRODUÇÃO COMPLETA"
              />
            </label>
            <label>
              Chamada superior (Eyebrow)
              <input
                name="eyebrow"
                maxLength={100}
                placeholder="Ex.: NOVIDADES NO CATÁLOGO"
              />
            </label>
          </div>

          <label>
            Descrição / Subtítulo
            <textarea
              name="subtitle"
              maxLength={500}
              placeholder="Ex.: Microfones profissionais, caixa de som amplificada com tripé e smartphones prontos para seu evento."
            />
          </label>

          <div className="grid">
            <label>
              Texto do Botão (CTA)
              <input
                name="linkText"
                maxLength={100}
                defaultValue="VER EQUIPAMENTOS & PREÇOS"
                placeholder="VER EQUIPAMENTOS & PREÇOS"
              />
            </label>
            <label>
              Link de Destino
              <input
                name="linkUrl"
                maxLength={300}
                defaultValue="#equipamentos"
                placeholder="Ex.: #equipamentos ou /?categoria=Áudio e vídeo"
              />
            </label>
          </div>

          <div className="grid">
            <label>
              Texto do Selo / Destaque (opcional)
              <input
                name="badgeText"
                maxLength={80}
                placeholder="Ex.: NOVO NO ESTOQUE!"
              />
            </label>
            <label>
              Ordem de exibição
              <input
                type="number"
                name="sortOrder"
                defaultValue={0}
                placeholder="0"
              />
            </label>
          </div>

          <label>
            Imagem do Banner / Produto
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
            />
            <small style={{ color: 'var(--muted)', fontWeight: 'normal' }}>
              Envie uma imagem JPG, PNG ou WebP de até 5 MB (será recortada e otimizada automaticamente).
            </small>
          </label>

          <div style={{ marginTop: '16px' }}>
            <button disabled={addPending}>
              {addPending ? 'Publicando banner…' : 'Salvar e Publicar Banner'}
            </button>
          </div>

          <Message state={addState} />
        </form>
      </div>
    </div>
  );
}

function BannerToggleButton({ id, active }: { id: string; active: boolean }) {
  const [state, action, pending] = useActionState(toggleBanner, initial);
  return (
    <form action={action} style={{ flex: 1 }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        style={{
          width: '100%',
          background: active ? '#eceeed' : '#14603e',
          color: active ? '#18282d' : '#fff',
          fontSize: '12px',
          padding: '8px 12px',
        }}
      >
        {pending ? 'Aguarde…' : active ? 'Pausar' : 'Ativar'}
      </button>
      {state.message && !state.ok && <span style={{ color: 'red', fontSize: '10px' }}>{state.message}</span>}
    </form>
  );
}

function BannerDeleteButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteBanner, initial);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Deseja realmente excluir este banner?')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        style={{
          background: '#fde9e4',
          color: '#8c2419',
          fontSize: '12px',
          padding: '8px 12px',
        }}
      >
        {pending ? '…' : 'Excluir'}
      </button>
      {state.message && !state.ok && <span style={{ color: 'red', fontSize: '10px' }}>{state.message}</span>}
    </form>
  );
}
