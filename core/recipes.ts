export type ingredient = {
	name: string;
	amount: number;
};

export type Recipe = {
	description: string;
	ingredients: ingredient[];
	output: ingredient;
};

export const recipes: Recipe[] = [
	{
		description: "3 mineral -> 1 refined mineral",
		ingredients: [{ name: "mineral", amount: 3 }],
		output: { name: "refined mineral", amount: 1 },
	},
	{
		description: "2 slimy moss -> 1 regular moss",
		ingredients: [{ name: "slimy moss", amount: 2 }],
		output: { name: "regular moss", amount: 1 },
	},
	{
		description: "3 regular moss -> 2 fluffy moss",
		ingredients: [{ name: "regular moss", amount: 3 }],
		output: { name: "fluffy moss", amount: 2 },
	},
];
