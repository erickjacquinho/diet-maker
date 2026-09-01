import type { AccountContext } from '@/lib/persistence/account-context';
import type { FoodCatalogRepository, ReadyMealRepository, RecipeRepository } from '@/lib/persistence/library-repository';

export interface LibraryApplicationDependencies {
  accountContext: AccountContext;
  foodRepository: FoodCatalogRepository;
  recipeRepository: RecipeRepository;
  readyMealRepository: ReadyMealRepository;
}
