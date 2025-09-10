import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header() {
  const t = await getTranslations('Header');

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-foreground hover:text-primary transition-colors">
          <UtensilsCrossed className="w-6 h-6 text-primary" />
          <span>{t('title')}</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin">{t('adminLink')}</Link>
          </Button>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
