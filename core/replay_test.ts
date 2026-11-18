import { assertEquals } from "@std/assert";
import { apply, type Command, type GameEvent, newGame } from "./mod.ts";
import fixture from "./run.json" with { type: "json" };

function playRun() {
	const state = newGame(fixture.seed);
	const events: GameEvent[] = [];
	const commands = fixture.commands as Command[];

	for (const command of commands) {
		events.push(...apply(state, command));
	}

	return { state, events };
}

Deno.test("recorded run successfully finishes the game", () => {
	const { state } = playRun();
	assertEquals(state.ended, true);
});

Deno.test("replay run is deterministic and stable", () => {
	const first = playRun();

	// Let the clock tick so that any stored timestamps won't match by luck
	const start = Date.now();
	while (Date.now() === start);

	const second = playRun();

	assertEquals(first, second);
	assertEquals(JSON.parse(JSON.stringify(first)), first);
});
