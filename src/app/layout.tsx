import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import {AppShell} from './components/app-shell';
import { brand } from '@/config/brand';
import './globals.css';
export const metadata:Metadata={title:brand.name,description:brand.tagline};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="pt-BR"><body style={{'--primary':brand.primary} as CSSProperties}><AppShell name={brand.name}>{children}</AppShell></body></html>;
}
