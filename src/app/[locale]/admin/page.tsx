import { getCategories } from '@/lib/mealie';
import { getAllPolls } from '@/lib/polls';
import AdminDashboard from './components/AdminDashboard';
import { getTranslations } from 'next-intl/server';

export default async function AdminPage() {
  const t = await getTranslations('AdminPage');
  
  // Fetch initial data on the server to pass to the client component
  // Error handling is done inside the lib functions, returning empty arrays on failure
  const initialCategories = await getCategories();
  const initialPolls = await getAllPolls();

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-8">{t('description')}</p>
      
      <AdminDashboard initialCategories={initialCategories} initialPolls={initialPolls} />
    </div>
  );
}
