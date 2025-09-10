import { getCategories } from '@/lib/mealie';
import { getAllPolls } from '@/lib/polls';
import AdminDashboard from './components/AdminDashboard';
import { getTranslations } from 'next-intl/server';
import PollsList from '@/components/polls/PollsList';
import { getRecipes } from '@/lib/mealie';

export default async function AdminPage() {
  const t = await getTranslations('AdminPage');
  
  const initialCategories = await getCategories();
  const initialPolls = await getAllPolls();
  // The PollsList needs all recipes to map IDs to names.
  const allRecipes = await getRecipes();

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-8">{t('description')}</p>
      
      <PollsList initialPolls={initialPolls} allRecipes={allRecipes} />

      <AdminDashboard initialCategories={initialCategories} />
    </div>
  );
}
