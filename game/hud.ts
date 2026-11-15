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
		case "gatherFailed":
			return `gather failed at ${event.at.x}, ${event.at.y}: cell depleted`;
	}
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
	}

	show(event: GameEvent) {
		element("live").textContent = describe(event);
		if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
		if (event.type === "gathered") {
			this.depleted.add(`${event.at.x},${event.at.y}`);
			this.showPosition(event.at.x, event.at.y);
		}
	}

	private showPosition(x: number, y: number) {
		element("position").textContent = `${x}, ${y}`;
		const suffix = this.depleted.has(`${x},${y}`) ? " (depleted)" : "";
		element("terrain").textContent = terrainAt(this.seed, x, y) + suffix;
	}
}
