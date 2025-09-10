import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
        <p>{t('text')}</p>
      </div>
    </footer>
  );
}
