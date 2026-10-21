import StoreLayout from '@/app/loja/layout';
import { StoreContent } from '@/app/loja/store-content';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  return (
    <StoreLayout>
      <StoreContent searchParams={searchParams} basePath="" />
    </StoreLayout>
  );
}
