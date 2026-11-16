import {
	type GameEvent,
	type GameState,
	terrainAt,
	TerrainResourceMap,
} from "../core/mod.ts";

function element(id: string): HTMLElement {
	return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
	switch (event.type) {
		case "moved":
			return `moved to ${event.to.x}, ${event.to.y}`;
		case "blocked":
			return `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
		case "gathered":
			return `gathered ${
				TerrainResourceMap[event.terrain]
			} from ${event.terrain} at ${event.at.x}, ${event.at.y}`;
		case "crafted":
			return `you crafted ${event.recipe.output.amount} ${event.recipe.output.name}`;
		case "craftingFailed": {
			let missingString =
				`you failed to craft ${event.recipe.output.name} because you were missing: `;
			for (let i = 0; i < event.missing.length; i++) {
				const missing = event.missing[i];
				missingString += `${missing.amount} ${missing.name}\n`;
			}
			return missingString;
		}
	}
	return "error";
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
	private readonly seed: number;
	private readonly depleted = new Set<string>();

	constructor(state: GameState) {
		this.seed = state.seed;
		for (const [key, condition] of Object.entries(state.changedCells)) {
			if (condition === "depleted") this.depleted.add(key);
		}
		this.showPosition(state.player.x, state.player.y);
		this.showInventory(state.inventory);
	}

	show(event: GameEvent) {
		element("live").textContent = describe(event);
		if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
		if (event.type === "gathered") {
			this.depleted.add(`${event.at.x},${event.at.y}`);
			this.showPosition(event.at.x, event.at.y);
			this.showInventory(event.inventory);
		}
		if (event.type === "crafted") {
			this.showInventory(event.inventory);
		}
	}

	private showInventory(inventory: Record<string, number>) {
		const list = element("inventory");
		list.replaceChildren();

		for (const [item, count] of Object.entries(inventory)) {
			const row = document.createElement("li");
			const name = document.createElement("span");
			const amount = document.createElement("strong");

			name.textContent = item;
			amount.textContent = String(count);
			row.append(name, amount);
			list.append(row);
		}
	}
	private showPosition(x: number, y: number) {
		element("position").textContent = `${x}, ${y}`;
		const suffix = this.depleted.has(`${x},${y}`) ? " (depleted)" : "";
		element("terrain").textContent = terrainAt(this.seed, x, y) + suffix;
	}
}
