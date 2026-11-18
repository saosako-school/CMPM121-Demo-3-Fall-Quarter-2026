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
			button.addEventListener("click", (event) => {
				craftFunction({ type: "craft", recipe: recipes[i] });
				if (event.detail > 0) {
					button.blur();
				}
			});
			listItem.append(button);
			recipeList.append(listItem);
			this.recipeButtons.push(button);
		}
	}

	updateTextContent(state: GameState) {
		for (let i = 0; i < this.recipeButtons.length; ++i) {
			const button = this.recipeButtons[i];
			const recipe = recipes[i];
			const ready = missingItemsForRecipe(state, recipes[i]).length == 0;

			button.classList.toggle("ready", ready);
			button.replaceChildren();

			const title = document.createElement("span");
			title.className = "recipe-title";
			title.textContent =
				`${recipe.output.name} ×${recipe.output.amount}`;

			const status = document.createElement("span");
			status.className = "recipe-status";
			status.textContent = ready ? "READY TO CRAFT" : "MISSING MATERIALS";

			const ingredientsList = document.createElement("div");
			ingredientsList.className = "recipe-ingredients";

			for (const ingredient of recipe.ingredients) {
				const ingredientTag = document.createElement("span");
				ingredientTag.className = "ingredient-tag";
				ingredientTag.textContent =
					`${ingredient.name} x${ingredient.amount}`;

				ingredientsList.append(ingredientTag);
			}
			button.append(title, ingredientsList, status);
		}
	}
}
