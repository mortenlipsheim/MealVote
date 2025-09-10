
'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Poll } from '@/lib/polls';
import { MealieRecipeSummary } from '@/lib/mealie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/navigation';
import { ExternalLink } from 'lucide-react';
import { Separator } from '../ui/separator';

type PollsListProps = {
  initialPolls: Poll[];
  allRecipes: MealieRecipeSummary[];
};

export default function PollsList({ initialPolls, allRecipes }: PollsListProps) {
  const t = useTranslations('PollsList');
  const format = useFormatter();
  
  if (initialPolls.length === 0) {
    return (
        <div className='my-8'>
            <h2 className="text-2xl font-headline font-bold">{t('existingPolls')}</h2>
            <p className="text-muted-foreground mt-2">{t('noPolls')}</p>
        </div>
    );
  }

  return (
    <div className="space-y-4 my-8">
      <h2 className="text-3xl font-headline font-bold text-center sm:text-left">{t('existingPolls')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialPolls.map(poll => (
          <Card key={poll.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-xl font-headline">
                <span>{t('poll')} #{poll.id.substring(0, 8)}</span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/vote/${poll.id}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" /> {t('view')}
                  </Link>
                </Button>
              </CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                {t('createdAt', { date: format.dateTime(new Date(poll.createdAt), { dateStyle: 'medium', timeStyle: 'short' }) })}
              </p>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">{t('results')}</h3>
              <ul className="space-y-2 text-sm">
                {Object.entries(poll.votes)
                  .sort(([, a], [, b]) => b - a)
                  .map(([recipeId, votes]) => {
                    const totalVotes = Object.values(poll.votes).reduce((sum, v) => sum + v, 0);
                    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                    const recipeName = allRecipes.find(r => r.id === recipeId)?.name || 'Unknown Recipe';
                    return (
                      <li key={recipeId}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{recipeName}</span>
                          <span className="font-semibold">{votes} {t('votes', {count: votes})}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <Separator />
    </div>
  );
}
