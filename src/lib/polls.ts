import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const pollsDirectory = path.join(process.cwd(), 'data', 'polls');

export interface Poll {
  id: string;
  recipeIds: string[];
  createdAt: string;
  votes: {
    [recipeId: string]: number;
  };
}

async function ensureDirectoryExists() {
  try {
    await fs.access(pollsDirectory);
  } catch {
    await fs.mkdir(pollsDirectory, { recursive: true });
  }
}

export async function createPoll(recipeIds: string[]): Promise<Poll> {
  await ensureDirectoryExists();
  const newPoll: Poll = {
    id: randomUUID(),
    recipeIds,
    createdAt: new Date().toISOString(),
    votes: recipeIds.reduce((acc, id) => {
      acc[id] = 0;
      return acc;
    }, {} as { [recipeId: string]: number }),
  };

  const filePath = path.join(pollsDirectory, `${newPoll.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(newPoll, null, 2));

  return newPoll;
}

export async function getPoll(id: string): Promise<Poll | null> {
  await ensureDirectoryExists();
  const filePath = path.join(pollsDirectory, `${id}.json`);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as Poll;
  } catch (error) {
    // This is expected if the file doesn't exist, so don't log an error.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    console.error(`Failed to read poll ${id}:`, error);
    return null;
  }
}

export async function getAllPolls(): Promise<Poll[]> {
  await ensureDirectoryExists();
  try {
    const files = await fs.readdir(pollsDirectory);
    const pollPromises = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const id = file.replace('.json', '');
        return getPoll(id);
      });
    const polls = await Promise.all(pollPromises);
    return polls.filter((p): p is Poll => p !== null).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Failed to read all polls:', error);
    return [];
  }
}

export async function addVote(pollId: string, recipeId: string): Promise<Poll | null> {
  const poll = await getPoll(pollId);
  if (!poll) {
    return null;
  }

  if (poll.votes[recipeId] !== undefined) {
    poll.votes[recipeId]++;
  } else {
    poll.votes[recipeId] = 1;
  }

  const filePath = path.join(pollsDirectory, `${pollId}.json`);
  await fs.writeFile(filePath, JSON.stringify(poll, null, 2));
  return poll;
}
