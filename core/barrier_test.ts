import { assertEquals } from "@std/assert";
import {
	apply,
	Cell,
	isPassable,
	newGame,
	Terrain,
	terrainAt,
	TerrainResourceMap,
} from "./mod.ts";

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

Deno.test("boots unlock the correct terrain", () => {
	const state = newGame(SEED);

	assertEquals(isPassable("acid", state), false);
	assertEquals(isPassable("crystal", state), false);

	state.inventory["acid boots"] = 1;

	assertEquals(isPassable("acid", state), true);
	assertEquals(isPassable("crystal", state), false);

	state.inventory["impenetrable boots"] = 1;

	assertEquals(isPassable("acid", state), true);
	assertEquals(isPassable("crystal", state), true);
});

Deno.test("acid boots allow entry and gathering on acid terrain", () => {
	const state = newGame(SEED);
	const barrier = findTerrain("acid");
	state.player = { x: barrier.x, y: barrier.y - 1 };

	const blocked = apply(state, { type: "move", direction: "south" });
	assertEquals(blocked[0].type, "blocked");

	state.inventory["acid boots"] = 1;

	const entered = apply(state, { type: "move", direction: "south" });
	assertEquals(entered[0].type, "moved");
	assertEquals(state.player, barrier);

	apply(state, { type: "gather" });

	assertEquals(state.inventory[TerrainResourceMap.acid], 1);
	assertEquals(state.inventory["acid boots"], 1);
});

Deno.test("impenetrable boots allow entry and gathering on crystal terrain", () => {
	const state = newGame(SEED);
	const barrier = findTerrain("crystal");
	state.player = { x: barrier.x, y: barrier.y - 1 };
	state.inventory["acid boots"] = 1;

	const blocked = apply(state, { type: "move", direction: "south" });
	assertEquals(blocked[0].type, "blocked");

	state.inventory["impenetrable boots"] = 1;

	const entered = apply(state, { type: "move", direction: "south" });
	assertEquals(entered[0].type, "moved");
	assertEquals(state.player, barrier);

	apply(state, { type: "gather" });

	assertEquals(state.inventory[TerrainResourceMap.crystal], 1);
	assertEquals(state.inventory["impenetrable boots"], 1);
});
