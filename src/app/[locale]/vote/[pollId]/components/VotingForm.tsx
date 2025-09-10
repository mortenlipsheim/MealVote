'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { MealieRecipeSummary } from '@/lib/mealie';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/recipes/RecipeCard';
import { useToast } from '@/hooks/use-toast';
import { submitVoteAction } from '../actions';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type VotingFormProps = {
  pollId: string;
  recipes: MealieRecipeSummary[];
};

export default function VotingForm({ pollId, recipes }: VotingFormProps) {
  const t = useTranslations('VotePage');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | undefined>();
  const [isSubmitting, startSubmitting] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRecipeId) {
      toast({
        variant: 'destructive',
        title: t('selectOption'),
      });
      return;
    }

    startSubmitting(async () => {
      try {
        await submitVoteAction(pollId, selectedRecipeId);
        toast({
          title: t('voteSubmitted'),
        });
        // Refresh the page to show results
        router.refresh();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error submitting vote',
          description: error instanceof Error ? error.message : String(error),
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <RadioGroup
        value={selectedRecipeId}
        onValueChange={setSelectedRecipeId}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {recipes.map(recipe => (
          <Label
            key={recipe.id}
            htmlFor={recipe.id}
            className="block cursor-pointer"
          >
            <RecipeCard recipe={recipe} isSelected={selectedRecipeId === recipe.id}>
              <div className="flex items-center space-x-2 mt-4">
                <RadioGroupItem value={recipe.id} id={recipe.id} />
                <span className="font-semibold">Vote for this meal</span>
              </div>
            </RecipeCard>
          </Label>
        ))}
      </RadioGroup>
      <div className="text-center">
        <Button type="submit" size="lg" disabled={isSubmitting || !selectedRecipeId} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            t('submitVote')
          )}
        </Button>
      </div>
    </form>
  );
}
