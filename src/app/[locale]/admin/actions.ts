'use server';

import { getRecipes } from '@/lib/mealie';
import { createPoll } from '@/lib/polls';
import { revalidatePath } from 'next/cache';

export async function getRecipesAction(category?: string) {
  try {
    return await getRecipes({ category: category === 'all' ? undefined : category });
  } catch (error) {
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: 'An unknown error occurred' };
  }
}

export async function createPollAction(recipeIds: string[]) {
  if (recipeIds.length < 2) {
    throw new Error('Please select at least two recipes to create a poll.');
  }
  const poll = await createPoll(recipeIds);
  revalidatePath('/[locale]/admin', 'page');
  return poll;
}
