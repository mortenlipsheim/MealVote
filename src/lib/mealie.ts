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

async function mealieFetch(endpoint: string) {
  if (!MEALIE_URL || !MEALIE_TOKEN) {
    throw new Error('Mealie API URL or Token is not configured in .env.local');
  }

  const res = await fetch(`${MEALIE_URL}/api${endpoint}`, {
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

export async function getRecipes(options?: { category?: string }): Promise<MealieRecipeSummary[]> {
  try {
    let endpoint = '/recipes?perPage=999';
    if (options?.category) {
      endpoint += `&filter[recipeCategory.slug]=${options.category}`;
    }
    const data = await mealieFetch(endpoint);
    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: `${MEALIE_URL}/api/media/recipes/${item.id}/images/original.webp`,
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
    const data = await mealieFetch('/recipes/categories?perPage=999');
    return data.items;
  } catch (error) {
    console.error('Error fetching Mealie categories:', error);
    return [];
  }
}

export async function getRecipe(id: string): Promise<MealieRecipe | null> {
    try {
        const item = await mealieFetch(`/recipes/${id}`);
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          image: `${MEALIE_URL}/api/media/recipes/${item.id}/images/original.webp`,
          description: item.description || 'No description available.',
          recipeCategory: item.recipeCategory,
        };
    } catch (error) {
        console.error(`Error fetching Mealie recipe ${id}:`, error);
        return null;
    }
}
