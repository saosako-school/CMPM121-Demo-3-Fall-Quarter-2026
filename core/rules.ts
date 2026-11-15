// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import {
	isPassable,
	type Terrain,
	terrainAt,
	TerrainResourceMap,
} from "./terrain.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
	seed: number;
	player: Cell;
	inventory: Record<string, number>;
	changedCells: Record<string, string>;
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command = { type: "move"; direction: Direction } | {
	type: "gather";
};

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
	| { type: "moved"; from: Cell; to: Cell }
	| { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
	| { type: "gathered"; at: Cell; terrain: Terrain }
	| { type: "gatherFailed"; at: Cell };

const STEPS: Record<Direction, Cell> = {
	north: { x: 0, y: -1 },
	south: { x: 0, y: 1 },
	east: { x: 1, y: 0 },
	west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
	return {
		seed,
		player: { x: 0, y: 0 },
		inventory: {
			"mineral": 0,
			"slimy moss": 0,
			"acid goop": 0,
			"glowing crystal": 0,
		},
		changedCells: {},
	};
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
	switch (command.type) {
		case "move":
			return move(state, command.direction);
		case "gather":
			return gather(state);
	}
}

function move(state: GameState, direction: Direction): GameEvent[] {
	const step = STEPS[direction];
	// Events are retained and played back later, while state keeps changing. So an
	// event gets cells of its own, never an object that state still holds.
	// Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
	// Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
	const from = { ...state.player };
	const to = { x: from.x + step.x, y: from.y + step.y };
	const terrain = terrainAt(state.seed, to.x, to.y);
	if (!isPassable(terrain)) {
		return [{ type: "blocked", at: from, toward: to, terrain }];
	}
	state.player.x = to.x;
	state.player.y = to.y;
	return [{ type: "moved", from, to }];
}

export function cellAt(state: GameState, cell: Cell) {
	return {
		terrain: terrainAt(state.seed, cell.x, cell.y),
		depleted: state.changedCells[`${cell.x},${cell.y}`] === "depleted",
	};
}

function gather(state: GameState): GameEvent[] {
	const at = { ...state.player };
	const { terrain, depleted } = cellAt(state, at);
	if (depleted) return [{ type: "gatherFailed", at }];

	const resource = TerrainResourceMap[terrain];
	state.inventory[resource] = (state.inventory[resource] ?? 0) + 1;
	state.changedCells[`${at.x},${at.y}`] = "depleted";
	return [{ type: "gathered", at, terrain }];
}
