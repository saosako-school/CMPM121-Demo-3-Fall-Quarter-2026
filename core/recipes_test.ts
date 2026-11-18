import { assertEquals } from "@std/assert";
import {
	apply,
	isPassable,
	newGame,
	recipes,
	Terrain,
	TerrainResourceMap,
} from "./mod.ts";

// Each test has a Given-When-Then shape: https://martinfowler.com/bliki/GivenWhenThen.html
const SEED = 121;

// Partner planted bug(step 7) that replaced previous craft output.
Deno.test("crafting twice keeps the output from both crafts", () => {
	const state = newGame(SEED);
	const recipe = recipes[0];

	for (const item of recipe.ingredients) {
		state.inventory[item.name] = item.amount * 2;
	}
	const first = apply(state, { type: "craft", recipe });
	assertEquals(first[0].type, "crafted");
	assertEquals(state.inventory[recipe.output.name], recipe.output.amount);
	const second = apply(state, { type: "craft", recipe });
	assertEquals(second[0].type, "crafted");
	assertEquals(state.inventory[recipe.output.name], recipe.output.amount * 2);
});

Deno.test("successfully crafting a recipe updates inventory and returns event", () => {
	const state = newGame(SEED);
	const recipe = recipes[0];

	// give player stuff for test recpie
	for (const ingidient of recipe.ingredients) {
		state.inventory[ingidient.name] = ingidient.amount;
	}

	// do craft
	const events = apply(state, { type: "craft", recipe });

	// asert that crafting succeded and the event was returned with expected details
	assertEquals(events, [{
		type: "crafted",
		at: state.player,
		recipe,
		inventory: state.inventory,
	}]);
});

Deno.test("crafting with insufficient items fails and changes nothing", () => {
	const state = newGame(SEED);
	const recipe = recipes[0];

	// ensure inventory is empty
	state.inventory = {};

	// take snapshot before tyring to craft
	const snapshot = JSON.parse(JSON.stringify(state));

	const events = apply(state, { type: "craft", recipe });

	// asert that the state didnt change at all
	assertEquals(state, snapshot);

	// assert that a failure event was returned, including missing the items
	assertEquals(events.length, 1);
	assertEquals(events[0].type, "craftingFailed");
});

Deno.test("every recipe input has a valid source (terrain or another recipe)", () => {
	const validSources = new Set<string>();
	const state = newGame(SEED);
	state.inventory["impenetrable boots"] = 1;

	// Collect gatherable resources from terrain map safely
	for (const terrain of Object.keys(TerrainResourceMap)) {
		if (isPassable(terrain as Terrain, state)) {
			const resource =
				TerrainResourceMap[terrain as keyof typeof TerrainResourceMap];
			validSources.add(resource);
		}
	}

	// Collect recipe outputs
	for (const recipe of recipes) {
		validSources.add(recipe.output.name);
	}

	// Verify every ingredient has a source
	for (const recipe of recipes) {
		for (const ingredient of recipe.ingredients) {
			assertEquals(
				validSources.has(ingredient.name),
				true,
				`Recipe ingredient "${ingredient.name}" has no source.`,
			);
		}
	}
});

Deno.test("a crafted event stays unchanged after later movement and crafting", () => {
	const state = newGame(SEED);
	const recipe = recipes[0];

	for (const item of recipe.ingredients) {
		state.inventory[item.name] = item.amount * 2;
	}

	const firstEvents = apply(state, { type: "craft", recipe });
	assertEquals(firstEvents[0].type, "crafted");

	const snapshot = JSON.parse(JSON.stringify(firstEvents));

	apply(state, { type: "move", direction: "east" });
	assertEquals(state.player, { x: 1, y: 0 });

	const secondEvents = apply(state, { type: "craft", recipe });
	assertEquals(secondEvents[0].type, "crafted");

	assertEquals(firstEvents, snapshot);
});
