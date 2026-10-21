import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LojaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const params = await searchParams;
  const search = new URLSearchParams();
  if (params.categoria) search.set('categoria', params.categoria);
  if (params.q) search.set('q', params.q);
  const query = search.toString();
  redirect(query ? `/?${query}` : '/');
}
