import { assertEquals } from "@std/assert";
import {
	apply,
	cellAt,
	isPassable,
	newGame,
	terrainAt,
	TerrainResourceMap,
} from "./mod.ts";

Deno.test("gathering each passable terrain awards its resource from an empty inventory", () => {
	const remaining = new Set(
		Object.keys(TerrainResourceMap).filter((terrain) => {
			const state = newGame(121);
			isPassable(terrain as Parameters<typeof isPassable>[0], state);
		}),
	);
	for (let y = -100; y <= 100 && remaining.size; y++) {
		for (let x = -100; x <= 100 && remaining.size; x++) {
			const terrain = terrainAt(121, x, y);
			if (!remaining.has(terrain)) continue;
			const state = newGame(121);
			state.inventory = {};
			state.player = { x, y };
			const before = JSON.parse(JSON.stringify(state));
			assertEquals(cellAt(state, state.player), {
				terrain,
				depleted: false,
			});
			assertEquals(state, before);

			const events = apply(state, { type: "gather" });

			assertEquals(state.inventory, { [TerrainResourceMap[terrain]]: 1 });
			assertEquals(state.changedCells, { [`${x},${y}`]: "depleted" });
			assertEquals(cellAt(state, state.player), {
				terrain,
				depleted: true,
			});
			assertEquals(events, [{
				type: "gathered",
				at: { x, y },
				terrain,
				inventory: { [TerrainResourceMap[terrain]]: 1 },
			}]);
			remaining.delete(terrain);
		}
	}
	assertEquals([...remaining], []);
});

Deno.test("gathering a depleted cell changes nothing and reports failure", () => {
	const state = newGame(121);
	apply(state, { type: "gather" });
	const before = JSON.parse(JSON.stringify(state));

	const events = apply(state, { type: "gather" });

	assertEquals(state, before);
	assertEquals(events, [{ type: "gatherFailed", at: { x: 0, y: 0 } }]);
});

Deno.test("gathering another cell works and returning does not replenish the first", () => {
	const state = newGame(121);
	const first = apply(state, { type: "gather" });
	const retained = JSON.parse(JSON.stringify(first));
	const expected = { ...state.inventory };
	apply(state, { type: "move", direction: "east" });
	assertEquals(state.player, { x: 1, y: 0 });
	const resource = TerrainResourceMap[cellAt(state, state.player).terrain];
	expected[resource] = (expected[resource] ?? 0) + 1;

	apply(state, { type: "gather" });

	assertEquals(state.inventory, expected);
	assertEquals(state.changedCells, { "0,0": "depleted", "1,0": "depleted" });
	assertEquals(first, retained);
	apply(state, { type: "move", direction: "west" });
	const before = JSON.parse(JSON.stringify(state));
	assertEquals(apply(state, { type: "gather" }), [{
		type: "gatherFailed",
		at: { x: 0, y: 0 },
	}]);
	assertEquals(state, before);
	assertEquals(JSON.parse(JSON.stringify(state)), state);
});
