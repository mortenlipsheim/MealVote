import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { Utensils } from 'lucide-react';
import { getAllPolls } from '@/lib/polls';
import { getRecipes } from '@/lib/mealie';
import PollsList from '@/components/polls/PollsList';

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  const polls = await getAllPolls();
  // We need all recipes to resolve names in the polls list.
  const recipes = await getRecipes();

  return (
    <div className="text-center flex flex-col items-center justify-center py-16">
      <div className="p-6 bg-primary/20 rounded-full mb-6">
        <Utensils className="w-16 h-16 text-primary" />
      </div>
      <h1 className="text-5xl font-headline font-bold text-foreground mb-4">
        {t('title')}
      </h1>
      <p className="text-2xl text-muted-foreground mb-8">{t('subtitle')}</p>
      <p className="max-w-2xl mx-auto mb-10 text-lg">
        {t('description')}
      </p>
      <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link href="/admin">{t('cta')}</Link>
      </Button>

      {polls.length > 0 && (
        <div className="mt-16 w-full max-w-4xl text-left">
           <PollsList initialPolls={polls} allRecipes={recipes} />
        </div>
      )}
    </div>
  );
}
