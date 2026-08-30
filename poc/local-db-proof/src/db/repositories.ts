import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { PocError, type ConfirmedFixture, type DietPlan, type Fixture, type LocalDatabasePort, type PortableSample, type SaveDietInput } from '../contracts';
import { fixture } from '../fixture';
import type { DatabaseHandle } from './client';
import { accounts, dietMealItems, dietMeals, dietPlans, patients, recipeIngredients, recipes } from './schema';

export class DatabaseRepository implements LocalDatabasePort {
  constructor(private readonly handle: DatabaseHandle) {}

  async open(): Promise<DatabaseHandle> {
    return this.handle;
  }

  async close(): Promise<void> {
    await this.handle.close();
  }

  async seedFixture(source: Fixture = fixture): Promise<void> {
    if (source.version !== 'fixture-v1') {
      throw new PocError('INTEGRITY_VIOLATION', 'seed-fixture', 'A versão da fixture não é suportada.', { version: source.version });
    }

    try {
      await this.handle.db.transaction(async (tx) => {
        await tx.insert(accounts).values(source.accounts);
        await tx.insert(patients).values(source.patients);
        await tx.insert(recipes).values(source.recipes);
        await tx.insert(recipeIngredients).values(source.recipeIngredients);
        if (this.handle.schemaVersion === '1') {
          for (const plan of source.dietPlans) {
            await tx.execute(sql`
              INSERT INTO diet_plans (id, account_id, patient_id, status, version, created_at, updated_at)
              VALUES (${plan.id}, ${plan.accountId}, ${plan.patientId}, ${plan.status}, ${plan.version}, ${plan.createdAt}, ${plan.updatedAt})
            `);
          }
        } else {
          await tx.insert(dietPlans).values(source.dietPlans);
        }
        await tx.insert(dietMeals).values(source.dietMeals);
        await tx.insert(dietMealItems).values(source.dietMealItems);
      });
    } catch (cause) {
      throw new PocError(
        'INTEGRITY_VIOLATION',
        'seed-fixture',
        'A fixture não pôde ser confirmada integralmente.',
        { fixtureVersion: source.version },
        { cause },
      );
    }
  }

  async readConfirmed(accountId: string): Promise<ConfirmedFixture> {
    const accountRows = await this.handle.db.select().from(accounts).where(eq(accounts.id, accountId));
    if (accountRows.length === 0) {
      throw new PocError('SCOPE_VIOLATION', 'read-confirmed', 'A Conta solicitada não existe.', { accountId });
    }

    const patientRows = await this.handle.db.select().from(patients).where(eq(patients.accountId, accountId));
    const recipeRows = await this.handle.db.select().from(recipes).where(eq(recipes.accountId, accountId));
    const recipeIds = recipeRows.map((recipe) => recipe.id);
    const recipeIngredientRows = recipeIds.length === 0
      ? []
      : await this.handle.db.select().from(recipeIngredients).where(inArray(recipeIngredients.recipeId, recipeIds));
    const dietPlanRows = await this.handle.db.select({
      id: dietPlans.id,
      accountId: dietPlans.accountId,
      patientId: dietPlans.patientId,
      status: dietPlans.status,
      version: dietPlans.version,
      createdAt: dietPlans.createdAt,
      updatedAt: dietPlans.updatedAt,
    }).from(dietPlans).where(eq(dietPlans.accountId, accountId));
    const dietPlanIds = dietPlanRows.map((plan) => plan.id);
    const dietMealRows = dietPlanIds.length === 0
      ? []
      : await this.handle.db.select().from(dietMeals).where(inArray(dietMeals.dietPlanId, dietPlanIds)).orderBy(asc(dietMeals.position));
    const dietMealIds = dietMealRows.map((meal) => meal.id);
    const dietMealItemRows = dietMealIds.length === 0
      ? []
      : await this.handle.db.select().from(dietMealItems).where(inArray(dietMealItems.mealId, dietMealIds));

    return {
      accounts: accountRows.map((account) => ({ ...account })),
      patients: patientRows.map((patient) => ({ ...patient })),
      recipes: recipeRows.map((recipe) => ({ ...recipe })),
      recipeIngredients: recipeIngredientRows.map((ingredient) => ({
        ...ingredient,
        sourceKind: ingredient.sourceKind as 'TACO' | 'CUSTOM',
      })),
      dietPlans: dietPlanRows.map((plan) => {
        const mapped: DietPlan = {
          id: plan.id,
          accountId: plan.accountId,
          patientId: plan.patientId,
          status: plan.status as 'ACTIVE' | 'SNAPSHOT',
          version: plan.version,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
        return mapped;
      }),
      dietMeals: dietMealRows.map((meal) => ({ ...meal })),
      dietMealItems: dietMealItemRows.map((item) => ({
        ...item,
        sourceKind: item.sourceKind as 'TACO' | 'CUSTOM',
      })),
    };
  }

  async saveDiet(input: SaveDietInput): Promise<DietPlan> {
    const { plan, meals, failAfter } = input;

    try {
      await this.handle.db.transaction(async (tx) => {
        const patientRows = await tx.select().from(patients).where(eq(patients.id, plan.patientId));
        const patient = patientRows[0];
        if (!patient || patient.accountId !== plan.accountId) {
          throw new PocError(
            'SCOPE_VIOLATION',
            'save-diet',
            'A dieta referencia um Paciente fora da Conta informada.',
            { accountId: plan.accountId, patientId: plan.patientId },
          );
        }

        for (const meal of meals) {
          if (meal.dietPlanId !== plan.id) {
            throw new PocError(
              'SCOPE_VIOLATION',
              'save-diet',
              'Uma refeição referencia outro cabeçalho de dieta.',
              { dietId: plan.id, mealId: meal.id, referencedDietId: meal.dietPlanId },
            );
          }
          for (const item of meal.items) {
            if (item.mealId !== meal.id) {
              throw new PocError(
                'SCOPE_VIOLATION',
                'save-diet',
                'Um item nutricional referencia outra refeição.',
                { mealId: meal.id, itemId: item.id, referencedMealId: item.mealId },
              );
            }
          }
        }

        if (plan.status === 'ACTIVE') {
          await tx.update(dietPlans)
            .set({ status: 'SNAPSHOT', updatedAt: plan.updatedAt })
            .where(and(eq(dietPlans.patientId, plan.patientId), eq(dietPlans.status, 'ACTIVE')));
        }

        await tx.insert(dietPlans).values(plan);
        if (failAfter === 'plan') {
          throw new PocError('INTEGRITY_VIOLATION', 'save-diet', 'Falha sintética após inserir o cabeçalho da dieta.');
        }

        for (const meal of meals) {
          await tx.insert(dietMeals).values({
            id: meal.id,
            dietPlanId: meal.dietPlanId,
            position: meal.position,
            name: meal.name,
          });
          if (failAfter === 'meal') {
            throw new PocError('INTEGRITY_VIOLATION', 'save-diet', 'Falha sintética após inserir uma refeição.');
          }

          for (const item of meal.items) {
            await tx.insert(dietMealItems).values(item);
            if (failAfter === 'item') {
              throw new PocError('INTEGRITY_VIOLATION', 'save-diet', 'Falha sintética após inserir um item nutricional.');
            }
          }
        }
      });

      return plan;
    } catch (cause) {
      if (cause instanceof PocError) {
        throw cause;
      }

      throw new PocError(
        'INTEGRITY_VIOLATION',
        'save-diet',
        'A gravação composta da dieta falhou e foi revertida.',
        { dietId: plan.id },
        { cause },
      );
    }
  }

  async replaceConfirmed(sample: PortableSample): Promise<void> {
    const records = sample.records;

    try {
      await this.handle.db.transaction(async (tx) => {
        const existingPlans = await tx.select({ id: dietPlans.id })
          .from(dietPlans)
          .where(eq(dietPlans.accountId, sample.accountId));
        const existingPlanIds = existingPlans.map((plan) => plan.id);
        const existingMeals = existingPlanIds.length === 0
          ? []
          : await tx.select({ id: dietMeals.id })
            .from(dietMeals)
            .where(inArray(dietMeals.dietPlanId, existingPlanIds));
        const existingMealIds = existingMeals.map((meal) => meal.id);
        const existingRecipes = await tx.select({ id: recipes.id })
          .from(recipes)
          .where(eq(recipes.accountId, sample.accountId));
        const existingRecipeIds = existingRecipes.map((recipe) => recipe.id);

        if (existingMealIds.length > 0) {
          await tx.delete(dietMealItems).where(inArray(dietMealItems.mealId, existingMealIds));
          await tx.delete(dietMeals).where(inArray(dietMeals.id, existingMealIds));
        }
        if (existingPlanIds.length > 0) {
          await tx.delete(dietPlans).where(inArray(dietPlans.id, existingPlanIds));
        }
        if (existingRecipeIds.length > 0) {
          await tx.delete(recipeIngredients).where(inArray(recipeIngredients.recipeId, existingRecipeIds));
          await tx.delete(recipes).where(inArray(recipes.id, existingRecipeIds));
        }
        await tx.delete(patients).where(eq(patients.accountId, sample.accountId));
        await tx.delete(accounts).where(eq(accounts.id, sample.accountId));

        await tx.insert(accounts).values(records.accounts);
        await tx.insert(patients).values(records.patients);
        await tx.insert(recipes).values(records.recipes);
        await tx.insert(recipeIngredients).values(records.recipeIngredients);
        await tx.insert(dietPlans).values(records.dietPlans);
        await tx.insert(dietMeals).values(records.dietMeals);
        await tx.insert(dietMealItems).values(records.dietMealItems);
      });
    } catch (cause) {
      throw new PocError(
        'IMPORT_REJECTED',
        'replace-confirmed',
        'A amostra não pôde substituir a Conta de forma transacional.',
        { accountId: sample.accountId },
        { cause },
      );
    }
  }
}

export type { DatabaseRepository as DatabaseRepositoryPort };

export function createDatabaseRepository(handle: DatabaseHandle): DatabaseRepository {
  return new DatabaseRepository(handle);
}
