import { assertEquals } from "@std/assert";
import { findUnreachableRecipes } from "./can_reach.ts";
import { type Recipe, recipes } from "./recipes.ts";

Deno.test("all game recipes are reachable", () => {
	assertEquals(findUnreachableRecipes(recipes), []);
});

Deno.test("a recipe cannot require itself", () => {
	const impossible: Recipe = {
		description: "An impossible recipe",
		ingredients: [{ name: "loop item", amount: 1 }],
		output: { name: "loop item", amount: 1 },
	};

	const table = recipes.slice();
	table.push(impossible);

	assertEquals(findUnreachableRecipes(table), [impossible]);
});

Deno.test("boots unlock new materials/terrain", () => {
	const table: Recipe[] = [
		{
			description: "Process acid terrain material",
			ingredients: [{ name: "acid goop", amount: 1 }],
			output: { name: "processed sample", amount: 1 },
		},
		{
			description: "Make acid boots",
			ingredients: [{ name: "mineral", amount: 1 }],
			output: { name: "acid boots", amount: 1 },
		},
	];

	assertEquals(findUnreachableRecipes(table), []);
});
