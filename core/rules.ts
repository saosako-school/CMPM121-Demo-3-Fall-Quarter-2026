// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

import { ingredient, Recipe } from "./recipes.ts";
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
} | { type: "craft"; recipe: Recipe };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
	| { type: "moved"; from: Cell; to: Cell }
	| { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
	| {
		type: "gathered";
		at: Cell;
		terrain: Terrain;
		inventory: Record<string, number>;
	}
	| { type: "gatherFailed"; at: Cell }
	| {
		type: "crafted";
		at: Cell;
		recipe: Recipe;
		inventory: Record<string, number>;
	}
	| {
		type: "craftingFailed";
		at: Cell;
		recipe: Recipe;
		missing: ingredient[];
	};

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
		inventory: {},
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
		case "craft":
			return craft(state, command.recipe);
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
	if (!isPassable(terrain, state)) {
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
	return [{
		type: "gathered",
		at,
		terrain,
		inventory: { ...state.inventory },
	}];
}

function craft(state: GameState, recipe: Recipe): GameEvent[] {
	// check for crafting failure
	const missingItems: ingredient[] = missingItemsForRecipe(state, recipe);
	if (missingItems.length > 0) {
		return [{
			type: "craftingFailed",
			at: state.player,
			recipe: recipe,
			missing: missingItems,
		}];
	}

	// else do remove ingidients and add crafted item in game state
	for (let i = 0; i < recipe.ingredients.length; i++) {
		const ingredient = recipe.ingredients[i];
		state.inventory[ingredient.name] -= ingredient.amount;
	}
	state.inventory[recipe.output.name] =
		(state.inventory[recipe.output.name] ?? 0) + recipe.output.amount;

	//return game event
	return [{
		type: "crafted",
		at: state.player,
		recipe: recipe,
		inventory: state.inventory,
	}];
}

// helper funciton that checks if the inventory has the required items for a recpie, and returns items that are missing and their amounts
export function missingItemsForRecipe(state: GameState, recipe: Recipe) {
	const missingItems: ingredient[] = [];
	for (let i = 0; i < recipe.ingredients.length; i++) {
		const ingredient = recipe.ingredients[i];
		const currentStock = state.inventory[ingredient.name] ?? 0;
		if (currentStock < ingredient.amount) {
			missingItems.push({
				name: ingredient.name,
				amount: ingredient.amount - currentStock,
			});
		}
	}
	return missingItems;
}
