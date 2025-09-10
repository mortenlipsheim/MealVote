import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MealieRecipeSummary } from '@/lib/mealie';
import { cn } from '@/lib/utils';

type RecipeCardProps = {
  recipe: MealieRecipeSummary;
  onClick?: () => void;
  isSelected?: boolean;
  children?: React.ReactNode;
};

export default function RecipeCard({ recipe, onClick, isSelected, children }: RecipeCardProps) {
  return (
    <Card
      className={cn(
        "h-full flex flex-col transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:-translate-y-1",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="aspect-[4/3] relative mb-4 rounded-md overflow-hidden">
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardTitle className="font-headline text-xl">{recipe.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <CardDescription className="flex-grow line-clamp-3 mb-4">{recipe.description}</CardDescription>
        {children}
      </CardContent>
    </Card>
  );
}
