CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diet_meal_items" (
	"id" text PRIMARY KEY NOT NULL,
	"meal_id" text NOT NULL,
	"source_kind" text NOT NULL,
	"source_id" text NOT NULL,
	"quantity_g" integer NOT NULL,
	"energy_kcal" real NOT NULL,
	"protein_g" real NOT NULL,
	"carbs_g" real NOT NULL,
	"fat_g" real NOT NULL,
	CONSTRAINT "diet_meal_items_source_kind_check" CHECK ("diet_meal_items"."source_kind" in ('TACO', 'CUSTOM')),
	CONSTRAINT "diet_meal_items_quantity_positive" CHECK ("diet_meal_items"."quantity_g" > 0),
	CONSTRAINT "diet_meal_items_nutrition_non_negative" CHECK ("diet_meal_items"."energy_kcal" >= 0 and "diet_meal_items"."protein_g" >= 0 and "diet_meal_items"."carbs_g" >= 0 and "diet_meal_items"."fat_g" >= 0)
);
--> statement-breakpoint
CREATE TABLE "diet_meals" (
	"id" text PRIMARY KEY NOT NULL,
	"diet_plan_id" text NOT NULL,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "diet_meals_plan_position" UNIQUE("diet_plan_id","position"),
	CONSTRAINT "diet_meals_position_non_negative" CHECK ("diet_meals"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "diet_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"status" text NOT NULL,
	"version" integer NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "diet_plans_status_check" CHECK ("diet_plans"."status" in ('ACTIVE', 'SNAPSHOT')),
	CONSTRAINT "diet_plans_version_positive" CHECK ("diet_plans"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"name" text NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "patients_account_id_id" UNIQUE("account_id","id")
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"source_kind" text NOT NULL,
	"source_id" text NOT NULL,
	"quantity_g" integer NOT NULL,
	CONSTRAINT "recipe_ingredients_source_kind_check" CHECK ("recipe_ingredients"."source_kind" in ('TACO', 'CUSTOM')),
	CONSTRAINT "recipe_ingredients_quantity_positive" CHECK ("recipe_ingredients"."quantity_g" > 0)
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"name" text NOT NULL,
	"yield_portions" integer NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "recipes_yield_portions_positive" CHECK ("recipes"."yield_portions" > 0)
);
--> statement-breakpoint
ALTER TABLE "diet_meal_items" ADD CONSTRAINT "diet_meal_items_meal_id_diet_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."diet_meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diet_meals" ADD CONSTRAINT "diet_meals_diet_plan_id_diet_plans_id_fk" FOREIGN KEY ("diet_plan_id") REFERENCES "public"."diet_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "diet_plans_one_active_per_patient" ON "diet_plans" USING btree ("patient_id") WHERE "diet_plans"."status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "patients_account_id_idx" ON "patients" USING btree ("account_id");