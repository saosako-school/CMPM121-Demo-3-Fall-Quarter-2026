import { assertEquals } from "@std/assert";
import { apply, Cell, newGame, Terrain, terrainAt } from "./mod.ts";

const SEED = 121;

function findTerrain(terrainType: Terrain): Cell {
	for (let x1 = -100; x1 < 100; x1++) {
		for (let y1 = -100; y1 < 100; y1++) {
			if (terrainAt(SEED, x1, y1) == terrainType) {
				return { x: x1, y: y1 };
			}
		}
	}
	// the error doesn't necessarily mean anything is wrong, just that a certain cell type is not closeby
	throw new Error(
		`No cell with terrain of type ${terrainType} could be found within 200 cells`,
	);
}

Deno.test("barrier is shut before obtaining opener item and open after (the acid boots or impenetrable boots), also check can gather while on it", () => {
	const state = newGame(SEED);

	// ensure inventory does not have opener item
	state.inventory = {};

	//find impassable terrain
	const barrier = findTerrain("acid");

	// place player next to it and make them walk into it
	state.player = { x: barrier.x, y: barrier.y - 1 };
	let events = apply(state, { type: "move", direction: "south" });

	// verify was blocked
	assertEquals(events[0].type, "blocked");

	// now test with item
	state.inventory["impenetrable boots"] = 1;
	events = apply(state, { type: "move", direction: "south" });

	// verify was not blocked
	assertEquals(events[0].type, "moved");

	// see if can gather now that on terrain
	events = apply(state, { type: "gather" });
	assertEquals(events[0].type, "gathered");
});
