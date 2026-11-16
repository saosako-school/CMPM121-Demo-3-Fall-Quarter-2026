import {
	type Command,
	type GameState,
	missingItemsForRecipe,
	recipes,
} from "../core/mod.ts";

export class RecipeBook {
	recipeButtons: HTMLButtonElement[] = [];
	constructor(
		_state: GameState,
		recipeList: HTMLUListElement,
		craftFunction: (command: Command) => void,
	) {
		for (let i = 0; i < recipes.length; ++i) {
			const button = document.createElement("button");
			const listItem = document.createElement("li");
			button.addEventListener("click", () => {
				craftFunction({ type: "craft", recipe: recipes[i] });
				button.blur();
			});
			listItem.append(button);
			recipeList.append(listItem);
			this.recipeButtons.push(button);
		}
	}

	updateTextContent(state: GameState) {
		for (let i = 0; i < this.recipeButtons.length; ++i) {
			const ready = missingItemsForRecipe(state, recipes[i]).length == 0;
			if (ready) {
				this.recipeButtons[i].textContent = `${
					recipes[i].description
				} READY TO CRAFT`;
			} else {
				this.recipeButtons[i].textContent = `${
					recipes[i].description
				} NOT ENOUGH MATERIALS`;
			}
		}
	}
}
