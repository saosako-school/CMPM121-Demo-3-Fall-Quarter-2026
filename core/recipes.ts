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
	{
		description: "2 fluffy moss + 5 refined mineral -> acid boots",
		ingredients: [{ name: "fluffy moss", amount: 2 }, {
			name: "refined mineral",
			amount: 5,
		}],
		output: { name: "acid boots", amount: 1 },
	},
	{
		description: "2 acid goop -> 1 potent acid",
		ingredients: [{ name: "acid goop", amount: 2 }],
		output: { name: "potent acid", amount: 1 },
	},
	{
		description:
			"2 potent acid + 3 refined mineral -> 2 reinforced minerals",
		ingredients: [{ name: "potent acid", amount: 2 }, {
			name: "refined mineral",
			amount: 3,
		}],
		output: { name: "reinforced minerals", amount: 2 },
	},
	{
		description: "acid boots + 5 reinforced minerals -> impenetrable boots",
		ingredients: [{ name: "acid boots", amount: 1 }, {
			name: "reinforced minerals",
			amount: 5,
		}],
		output: { name: "impenetrable boots", amount: 1 },
	},
];
