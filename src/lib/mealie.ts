const MEALIE_URL = process.env.MEALIE_API_URL;
const MEALIE_TOKEN = process.env.MEALIE_API_TOKEN;

export interface MealieRecipeSummary {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  recipeCategory: { name: string, id: string }[];
}

export interface MealieRecipe extends MealieRecipeSummary {}

export interface MealieCategory {
  id: string;
  name: string;
  slug: string;
}

const MEALIE_API_BASE_URL = MEALIE_URL ? `${MEALIE_URL.replace(/\/$/, '')}/api` : '';

async function mealieFetch(endpoint: string) {
  if (!MEALIE_API_BASE_URL || !MEALIE_TOKEN) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Mealie API URL or Token is not configured. Please check your .env.local file.');
      // Return a structure that looks like the API response for `items`
      return { items: [] }; 
    }
    throw new Error('Mealie API URL or Token is not configured in .env.local');
  }

  const url = `${MEALIE_API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${MEALIE_TOKEN}`
    },
    next: { revalidate: 3600 } 
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Mealie API error on ${endpoint}:`, res.status, errorBody);
    throw new Error(`Failed to fetch from Mealie API. Status: ${res.status}`);
  }

  return res.json();
}

function getImageUrl(recipeId: string): string {
    if (!MEALIE_URL || !recipeId) {
        return 'https://placehold.co/600x400?text=No+Image';
    }
    return `${MEALIE_URL.replace(/\/$/, '')}/api/media/recipes/${recipeId}/images/original.webp`;
}

export async function getRecipes(options?: { categories?: string[] }): Promise<MealieRecipeSummary[]> {
  try {
    let endpoint = '/recipes?perPage=999';
    if (options?.categories && options.categories.length > 0) {
      const categoryFilter = options.categories.map(slug => `&filter[categories.slug]=${slug}`).join('');
      endpoint += categoryFilter;
    }
    const data = await mealieFetch(endpoint);
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: getImageUrl(item.id),
      description: item.description || 'No description available.',
      recipeCategory: item.recipeCategory,
    }));
  } catch (error) {
    console.error('Error fetching Mealie recipes:', error);
    return [];
  }
}

export async function getCategories(): Promise<MealieCategory[]> {
  try {
    const data = await mealieFetch('/organizers/categories?perPage=999');
    return data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
    }));
  } catch (error) {
    console.error('Error fetching Mealie categories:', error);
    return [];
  }
}

export async function getRecipe(id: string): Promise<MealieRecipe | null> {
    try {
        const item = await mealieFetch(`/recipes/${id}`);
        if (!item) return null;
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          image: getImageUrl(item.id),
          description: item.description || 'No description available.',
          recipeCategory: item.recipeCategory,
        };
    } catch (error) {
        console.error(`Error fetching Mealie recipe ${id}:`, error);
        return null;
    }
}
