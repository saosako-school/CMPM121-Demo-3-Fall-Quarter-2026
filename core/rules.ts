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

function gather(state: GameState): GameEvent[] {
	const currentTile = { ...state.player };
	//do something
	const coords = `${currentTile.x},${currentTile.y}`;
	if (coords in state.changedCells) {
		console.log("cry");
		return [{ type: "gatherFailed", at: currentTile }];
		// create game event
	} else {
		const yieldedResource = TerrainResourceMap[
			terrainAt(state.seed, currentTile.x, currentTile.y)
		];
		state.inventory[yieldedResource] += 1;
		state.changedCells[coords] = "depleted";
		return [{
			type: "gathered",
			at: currentTile,
			terrain: terrainAt(state.seed, currentTile.x, currentTile.y),
		}];
	}
	// code for when eventually having to deal with checkin for tiles changing / cant gether there (later problem)
	/*if () {

  }
  else {
    state.inventory[terrainAt(state.seed, currentTile.x, currentTile.y)] += 1;
    return [{
      type: "gathered",
      at: { x: currentTile.x, y: currentTile.y },
      terrain: terrainAt(state.seed, currentTile.x, currentTile.y),
    }];
  }
  */

	/*const yieldedResource =
		TerrainResourceMap[terrainAt(state.seed, currentTile.x, currentTile.y)];
	state.inventory[yieldedResource] += 1;
	//state.inventory[terrainAt(state.seed, currentTile.x, currentTile.y)] += 1;

	return [{
		type: "gathered",
		at: { x: currentTile.x, y: currentTile.y },
		terrain: terrainAt(state.seed, currentTile.x, currentTile.y),
	}];*/
}
