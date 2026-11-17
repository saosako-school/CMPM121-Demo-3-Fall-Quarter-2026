import { assert, assertEquals } from "@std/assert";
import { apply, type Command, newGame, recipes } from "./mod.ts";

//If the final recipe is not present, the test will fail.
function winningRecipe() {
	const recipe = recipes.find((recipe) => recipe.winsGame);
	assert(recipe, "A winning recipe must exist.");
	return recipe;
}

Deno.test("regular crafting does not end the game", () => {
	const state = newGame(121);
	const recipe = recipes.find((recipe) => !recipe.winsGame);
	assert(recipe);

	for (const item of recipe.ingredients) {
		state.inventory[item.name] = item.amount;
	}

	const events = apply(state, { type: "craft", recipe });

	assertEquals(state.ended, false);
	assertEquals(events.map((event) => event.type), ["crafted"]);
});

Deno.test("crafting the final repair ends the game after crafting", () => {
	const state = newGame(121);
	const recipe = winningRecipe();

	for (const item of recipe.ingredients) {
		state.inventory[item.name] = item.amount;
	}

	const events = apply(state, { type: "craft", recipe });

	assertEquals(state.ended, true);
	assertEquals(
		state.inventory[recipe.output.name],
		recipe.output.amount,
	);
	assertEquals(events.map((event) => event.type), ["crafted", "ended"]);
});

Deno.test("a failed final repair does not end the game", () => {
	const state = newGame(121);
	const before = JSON.parse(JSON.stringify(state));

	const events = apply(state, {
		type: "craft",
		recipe: winningRecipe(),
	});

	assertEquals(state, before);
	assertEquals(events[0].type, "craftingFailed");
});

Deno.test("all commands leave an ended game unchanged", () => {
	const state = newGame(121);
	const recipe = winningRecipe();

	for (const item of recipe.ingredients) {
		state.inventory[item.name] = item.amount;
	}

	apply(state, { type: "craft", recipe });
	assertEquals(state.ended, true);

	const before = JSON.parse(JSON.stringify(state));
	const commands: Command[] = [
		{ type: "move", direction: "east" },
		{ type: "gather" },
		{ type: "craft", recipe },
	];

	for (const command of commands) {
		assertEquals(apply(state, command), []);
		assertEquals(state, before);
	}
});
