import { assert, assertEquals } from "@std/assert";
import { findUnreachableRecipes } from "./can_reach.ts";
import { type Recipe, recipes } from "./recipes.ts";

Deno.test("the final ship repair is reachable", () => {
	const winner = recipes.find((recipe) => recipe.winsGame);
	assert(winner, "A winning recipe must exist.");

	const unreachable = findUnreachableRecipes(recipes);

	assertEquals(
		unreachable.includes(winner),
		false,
		"The final ship repair is unreachable.",
	);
});

Deno.test("a final repair with an unavailable ingredient is unreachable", () => {
	const brokenRecipes: Recipe[] = [];

	for (const recipe of recipes) {
		if (recipe.winsGame) {
			brokenRecipes.push({
				...recipe,
				ingredients: [{
					name: "unobtainable repair component",
					amount: 1,
				}],
			});
		} else {
			brokenRecipes.push(recipe);
		}
	}

	const winner = brokenRecipes.find((recipe) => recipe.winsGame);
	assert(winner);

	const unreachable = findUnreachableRecipes(brokenRecipes);

	assertEquals(unreachable.includes(winner), true);
});
