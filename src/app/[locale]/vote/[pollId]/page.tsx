
import { getPoll } from '@/lib/polls';
import { getRecipe, MealieRecipeSummary } from '@/lib/mealie';
import { notFound } from 'next/navigation';
import VotingForm from './components/VotingForm';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  params: { pollId: string };
};

export default async function VotePage({ params }: Props) {
  const t = await getTranslations('VotePage');
  const poll = await getPoll(params.pollId);

  if (!poll) {
    notFound();
  }
  
  const cookieStore = cookies();
  const hasVoted = cookieStore.get(`voted-${params.pollId}`);

  // Fetch recipe details for displaying results, regardless of whether the user has voted
  const recipeDetailsPromises = poll.recipeIds.map(id => getRecipe(id));
  const recipes = (await Promise.all(recipeDetailsPromises)).filter((r): r is MealieRecipeSummary => r !== null);

  if (hasVoted) {
    const totalVotes = Object.values(poll.votes).reduce((sum, v) => sum + v, 0);

    return (
        <div className="max-w-2xl mx-auto text-center py-10">
            <Alert className="bg-primary/10 border-primary text-center">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="text-xl font-bold font-headline">{t('alreadyVoted')}</AlertTitle>
                <AlertDescription>{t('voteSubmitted')}</AlertDescription>
            </Alert>
            <div className="mt-8">
                <h2 className="text-2xl font-bold font-headline mb-4">{t('results')}</h2>
                 <div className="space-y-4 text-left">
                    {recipes.map(recipe => {
                        const votes = poll.votes[recipe.id] || 0;
                        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                        return (
                             <div key={recipe.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-1 font-semibold">
                                    <span>{recipe.name}</span>
                                    <span>{votes} vote(s)</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-4">
                                    <div className="bg-accent h-4 rounded-full flex items-center justify-end text-xs font-bold text-accent-foreground pr-2" style={{ width: `${percentage}%` }}>
                                        {percentage.toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
             <Button asChild className="mt-8">
                <Link href="/">{t('goHome')}</Link>
            </Button>
        </div>
    )
  }
  
  if (recipes.length === 0) {
      return (
        <div className="max-w-2xl mx-auto text-center py-10">
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Could not load recipes for this poll. Please try again later.</AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
                <Link href="/">{t('goHome')}</Link>
            </Button>
        </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <VotingForm pollId={poll.id} recipes={recipes} />
    </div>
  );
}
