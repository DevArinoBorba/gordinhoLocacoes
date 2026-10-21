'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 18px',
        cursor: 'pointer',
      }}
    >
      🖨️ Imprimir / Salvar em PDF
    </button>
  );
}
