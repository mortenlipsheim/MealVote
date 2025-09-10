'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useFormatter } from 'next-intl';
import { MealieCategory, MealieRecipeSummary } from '@/lib/mealie';
import { Poll } from '@/lib/polls';
import { getRecipesAction, createPollAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import RecipeCard from '@/components/recipes/RecipeCard';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, ExternalLink, Loader2, Info } from 'lucide-react';
import Link from 'next/link';

type AdminDashboardProps = {
  initialCategories: MealieCategory[];
  initialPolls: Poll[];
};

export default function AdminDashboard({ initialCategories, initialPolls }: AdminDashboardProps) {
  const t = useTranslations('AdminPage');
  const format = useFormatter();
  const { toast } = useToast();

  const [recipes, setRecipes] = useState<MealieRecipeSummary[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<MealieRecipeSummary[]>([]);
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newPollUrl, setNewPollUrl] = useState('');
  
  const [isFetchingRecipes, startFetchingRecipes] = useTransition();
  const [isCreatingPoll, startCreatingPoll] = useTransition();

  useEffect(() => {
    fetchRecipes('all');
  }, []);

  const fetchRecipes = (category: string) => {
    startFetchingRecipes(async () => {
      const result = await getRecipesAction(category);
      if ('error' in result) {
        toast({
            variant: "destructive",
            title: "Failed to fetch recipes",
            description: result.error,
        });
        setRecipes([]);
      } else {
        setRecipes(result);
      }
    });
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    fetchRecipes(categorySlug);
  };

  const toggleRecipeSelection = (recipe: MealieRecipeSummary) => {
    setSelectedRecipes(prev =>
      prev.some(r => r.id === recipe.id)
        ? prev.filter(r => r.id !== recipe.id)
        : [...prev, recipe]
    );
  };

  const handleCreatePoll = () => {
    if (selectedRecipes.length < 2) return;
    startCreatingPoll(async () => {
      try {
        const newPoll = await createPollAction(selectedRecipes.map(r => r.id));
        setPolls(prev => [newPoll, ...prev]);
        setNewPollUrl(`${window.location.origin}/vote/${newPoll.id}`);
        setSelectedRecipes([]);
        toast({
          title: t('pollCreated'),
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error creating poll',
          description: error instanceof Error ? error.message : String(error),
        });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: t('copied') });
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('selectRecipes')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select onValueChange={handleCategoryChange} defaultValue="all">
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder={t('filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {initialCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRecipes.length > 0 && (
              <div className="flex-grow flex items-center justify-between bg-primary/10 p-2 rounded-lg">
                 <p className="text-sm font-medium">{t('selectedTitle')}: {selectedRecipes.length}</p>
                 <Button variant="ghost" size="sm" onClick={() => setSelectedRecipes([])}>{t('clearSelection')}</Button>
              </div>
            )}
          </div>

          {isFetchingRecipes ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>{t('loadingRecipes')}</span>
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => toggleRecipeSelection(recipe)}
                  isSelected={selectedRecipes.some(r => r.id === recipe.id)}
                />
              ))}
            </div>
          ) : (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Recipes</AlertTitle>
                <AlertDescription>{t('noRecipes')}</AlertDescription>
            </Alert>
          )}

          {selectedRecipes.length > 1 && (
            <div className="flex justify-center pt-6">
              <Button size="lg" onClick={handleCreatePoll} disabled={isCreatingPoll}>
                {isCreatingPoll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCreatingPoll ? t('creatingPoll') : t('createPoll', { count: selectedRecipes.length })}
              </Button>
            </div>
          )}

          {newPollUrl && (
            <Alert className="mt-6 bg-accent/20 border-accent">
              <AlertTitle className="font-headline">{t('pollCreated')}</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                <p className="font-medium text-sm text-foreground">{t('pollLink')}</p>
                <div className="flex items-center gap-2 bg-background p-2 rounded-md w-full sm:w-auto">
                    <code className="text-sm truncate">{newPollUrl}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(newPollUrl)}>
                        <Clipboard className="h-4 w-4" />
                    </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Separator />

      <div className="space-y-4">
        <h2 className="text-2xl font-headline font-bold">{t('existingPolls')}</h2>
        {polls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polls.map(poll => (
              <Card key={poll.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-lg">
                    <span>{t('poll')} #{poll.id.substring(0, 8)}</span>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/vote/${poll.id}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4"/> View
                        </Link>
                    </Button>
                  </CardTitle>
                   <p className="text-sm text-muted-foreground pt-1">
                    {t('createdAt', {date: format.dateTime(new Date(poll.createdAt), {dateStyle: 'medium', timeStyle: 'short'})})}
                   </p>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-2">{t('results')}</h3>
                    <ul className="space-y-2 text-sm">
                        {Object.entries(poll.votes).map(([recipeId, votes]) => {
                            const totalVotes = Object.values(poll.votes).reduce((sum, v) => sum + v, 0);
                            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                            const recipeName = recipes.find(r => r.id === recipeId)?.name || 'Unknown Recipe';
                            return (
                                <li key={recipeId}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span>{recipeName}</span>
                                        <span className="font-semibold">{votes} {t('votes')}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">{t('noPolls')}</p>
        )}
      </div>
    </div>
  );
}
