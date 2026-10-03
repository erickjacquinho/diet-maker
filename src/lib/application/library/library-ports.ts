import type { AccountContext } from '@/lib/persistence/account-context';
import type { FoodCatalogRepository, ReadyDietRepository, ReadyMealRepository, RecipeRepository } from '@/lib/persistence/library-repository';

export interface LibraryApplicationDependencies {
  accountContext: AccountContext;
  foodRepository: FoodCatalogRepository;
  recipeRepository: RecipeRepository;
  readyMealRepository: ReadyMealRepository;
  readyDietRepository: ReadyDietRepository;
  confirmedOperation?: import('../composition-root').ConfirmedOperationCoordinator;
}
