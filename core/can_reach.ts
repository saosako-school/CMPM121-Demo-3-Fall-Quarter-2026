import {
	isPassable,
	newGame,
	Recipe,
	TerrainResourceMap,
	TERRAINS,
} from "./mod.ts";

export function findUnreachableRecipes(recipes: Recipe[]): Recipe[] {
	//intialize
	const state = newGame(121);
	const reached: string[] = [];
	const made: number[] = [];

	let changed = true; // checking to see if anything new has been accessed after a full lap, if no, then cant stop looping cause anything that can be reached is reached
	do {
		changed = false;
		// update terrain in case we got the items required to move onto impassibles
		for (let i = 0; i < TERRAINS.length; i++) {
			const terrain = TERRAINS[i];
			const resource = TerrainResourceMap[terrain];
			if (isPassable(terrain, state) && !(reached.includes(resource))) {
				reached.push(resource);
				changed = true;
			}
		}
		// check if we have unlocked any new recipies
		for (let i = 0; i < recipes.length; i++) {
			const recipe = recipes[i];
			if (made.includes(i)) {
				continue;
			}
			let canMake = true;
			for (let j = 0; j < recipe.ingredients.length; ++j) {
				if (!reached.includes(recipe.ingredients[j].name)) {
					canMake = false;
					break;
				}
			}
			if (canMake) {
				made.push(i);
				reached.push(recipe.output.name);
				state.inventory[recipe.output.name] = 1;
				changed = true;
			}
		}
	} while (changed);

	// test which items got left out
	const missing: Recipe[] = [];
	for (let i = 0; i < recipes.length; i++) {
		if (!made.includes(i)) {
			missing.push(recipes[i]);
		}
	}

	return missing;
}
