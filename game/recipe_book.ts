import {
	type GameState,
	type ingredient,
	type Recipe,
    type Command,
	recipes,
} from "../core/mod.ts";

export class RecipeBook {
	recipeButtons: HTMLButtonElement[] = [];
	constructor(
		state: GameState,
		recipeList: HTMLUListElement,
		craftFunction: (command: Command) => void,
	) {
		for (let i = 0; i < recipes.length; ++i) {
			const button = document.createElement("button");
            const listItem = document.createElement("li");
			button.textContent = recipes[i].description;
			button.addEventListener("click", () => {
                craftFunction({type: "craft", recipe: recipes[i]}); 
                button.blur();});
			state.append(button);
            this.recipeButtons.append(button, listItem);
		}
	}

	
}
