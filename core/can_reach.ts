import {
	isPassable,
	newGame,
	Recipe,
	TerrainResourceMap,
	TERRAINS,
} from "./mod.ts";

function _findUnreachableRecipes(recipes: Recipe[]): string[] {
	//intialize
	const state = newGame(121);
	const reached: string[] = [];
	const made: string[] = [];

	let changed = true; // checking to see if anything new has been accessed after a full lap, if no, then cant stop looping cause anything that can be reached is reached
	do {
		changed = false;
		// update terrain in case we got the items required to move onto impassibles
		for (let i = 0; i < TERRAINS.length; i++) {
			const terrain = TERRAINS[i];
			if (isPassable(terrain, state) && !(reached.includes(terrain))) {
				reached.push(TerrainResourceMap[terrain]);
				changed = true;
			}
		}
		// check if we have unlocked any new recipies
		for (let i = 0; i < recipes.length; i++) {
			const recipe = recipes[i];
			if (made.includes(recipe.output.name)) {
				continue;
			}
			for (let j = 0; j < recipe.ingredients.length; ++j) {
				if (
					!(reached.includes(recipe.ingredients[j].name) ||
						made.includes(recipe.ingredients[j].name))
				) {
					break;
				}
				if (j === recipe.ingredients.length - 1) {
					made.push(recipe.output.name);
					state.inventory[recipe.output.name] = 1;
					changed = true;
				}
			}
		}
	} while (changed);

	// test which items got left out
	const missing: string[] = [];
	for (let i = 0; i < recipes.length; i++) {
		const recipeName = recipes[i].output.name;
		if (!made.includes(recipeName)) {
			missing.push(recipeName);
		}
	}

	return missing;
}
