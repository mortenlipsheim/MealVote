
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { MealieCategory, MealieRecipeSummary } from '@/lib/mealie';
import { createPollAction, getRecipesAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import RecipeCard from '@/components/recipes/RecipeCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, Loader2, Info, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

type AdminDashboardProps = {
  initialCategories: MealieCategory[];
};

export default function AdminDashboard({ initialCategories }: AdminDashboardProps) {
  const t = useTranslations('AdminPage');
  const locale = useLocale();
  const { toast } = useToast();

  const [recipes, setRecipes] = useState<MealieRecipeSummary[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<MealieRecipeSummary[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newPollUrl, setNewPollUrl] = useState('');
  
  const [isFetchingRecipes, startFetchingRecipes] = useTransition();
  const [isCreatingPoll, startCreatingPoll] = useTransition();

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategories]);

  const fetchRecipes = () => {
    startFetchingRecipes(async () => {
      const result = await getRecipesAction(selectedCategories);
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
  
  const handleCategorySelection = (categorySlug: string) => {
    setSelectedCategories(prev =>
      prev.includes(categorySlug)
        ? prev.filter(slug => slug !== categorySlug)
        : [...prev, categorySlug]
    );
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
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        setNewPollUrl(`${siteUrl}/${locale}/vote/${newPoll.id}`);
        setSelectedRecipes([]);
        toast({
          title: t('pollCreated'),
        });
        // We no longer manage polls here, so we don't need to update state
        // A page refresh would show the new poll in the separate component
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
  
  const getCategoryFilterLabel = () => {
    if (selectedCategories.length === 0) {
      return t('filterByCategory');
    }
    if (selectedCategories.length === 1) {
      const cat = initialCategories.find(c => c.slug === selectedCategories[0]);
      return cat?.name ?? t('filterByCategory');
    }
    return t('categoriesSelected', {count: selectedCategories.length});
  }

  return (
    <div className="space-y-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('selectRecipes')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[280px] justify-between">
                  <span>{getCategoryFilterLabel()}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[280px]">
                <DropdownMenuLabel>{t('filterByCategory')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {initialCategories.length > 0 ? initialCategories.map(cat => (
                  <DropdownMenuCheckboxItem
                    key={cat.id}
                    checked={selectedCategories.includes(cat.slug)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => handleCategorySelection(cat.slug)}
                  >
                    {cat.name}
                  </DropdownMenuCheckboxItem>
                )) : <DropdownMenuLabel className="font-normal text-muted-foreground">{t('noCategories')}</DropdownMenuLabel> }
              </DropdownMenuContent>
            </DropdownMenu>
            
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
    </div>
  );
}
