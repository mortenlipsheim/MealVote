'use server';

import { addVote } from '@/lib/polls';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function submitVoteAction(pollId: string, recipeId: string) {
    const cookieStore = cookies();
    const hasVotedCookie = `voted-${pollId}`;

    if (cookieStore.get(hasVotedCookie)) {
        throw new Error('You have already voted on this poll.');
    }

    if (!recipeId) {
        throw new Error('Please select a recipe to vote for.');
    }

    const updatedPoll = await addVote(pollId, recipeId);
    if (!updatedPoll) {
        throw new Error('Failed to record vote. The poll may no longer exist.');
    }
    
    // Set a cookie to prevent re-voting. Expires in 1 year.
    cookieStore.set(hasVotedCookie, 'true', { maxAge: 60 * 60 * 24 * 365, path: '/' });

    // Revalidate paths to update data for admin and for voters who refresh
    revalidatePath('/[locale]/admin', 'page');
    revalidatePath('/[locale]/vote/[pollId]', 'page');

    return { success: true };
}
