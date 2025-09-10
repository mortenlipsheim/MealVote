'use server';

import { getRecipes } from '@/lib/mealie';
import { createPoll, deletePoll } from '@/lib/polls';
import { revalidatePath } from 'next/cache';

export async function getRecipesAction(categories?: string[]) {
  try {
    return await getRecipes({ categories: categories && categories.length > 0 ? categories : undefined });
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
  revalidatePath('/[locale]', 'page');
  return poll;
}


export async function deletePollAction(pollId: string) {
  try {
    await deletePoll(pollId);
    revalidatePath('/[locale]/admin', 'page');
    revalidatePath('/[locale]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete poll:', error);
    return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred.' };
  }
}
