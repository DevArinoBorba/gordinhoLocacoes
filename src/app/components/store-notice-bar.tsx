import Link from 'next/link';
import type { StoreNotice } from '@/lib/queries';

export function StoreNoticeBar({ notice }: { notice: StoreNotice }) {
  if (!notice.enabled) return null;

  const content = (
    <div
      className={`store-notice-bar ${notice.variant} ${notice.animated ? 'is-animated' : ''}`}
      role="banner"
      aria-label="Aviso da loja"
    >
      <div className="store-notice-inner">
        {notice.badge_text && (
          <span className="notice-badge">
            <span className="notice-badge-dot" />
            {notice.badge_text}
          </span>
        )}

        <span className="notice-message">{notice.message}</span>

        {notice.link_url && (
          <span className="notice-link-btn">
            {notice.link_text || 'Saiba mais'} <span className="notice-arrow">→</span>
          </span>
        )}
      </div>

      {notice.animated && <div className="notice-shine" />}
    </div>
  );

  if (notice.link_url) {
    return (
      <Link href={notice.link_url} className="store-notice-wrapper">
        {content}
      </Link>
    );
  }

  return content;
}
