# Manual test script

For a person, or an agent driving a browser. Run `deno task dev` and open the local URL with `?seed=121`. Before each section, reload. To read logical state, use `game.state` in the console. To read what has played, use the panel beside the grid, including the `#live` text, or look at the marker.

**Promotion rule:** a bug found by hand or by an agent becomes a permanent test in `core/` before it is fixed, unless it truly lives in `game/`, in which case add a step here.

| #  | Action                                                    | Expected observation                                                                                                                                          |
| -- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Load the page                                             | One canvas. A pale marker at the center of a green map. No console errors.                                                                                    |
| 2  | Tap the right arrow                                       | The marker slides one cell east. `#live` says `moved to 1, 0`. `player` is `{ x: 1, y: 0 }`.                                                                  |
| 3  | Walk until acid or crystal is ahead, then press toward it | The marker lurches and flashes red, then returns to its cell. `#live` says `blocked by acid at ...` or `blocked by crystal at ...`. `player` has not changed. |
| 4  | Tap an arrow during a walk                                | The tap waits. The marker finishes the walk, then takes that step. It never skips a cell.                                                                     |
| 5  | Mash arrows quickly, then stop                            | The marker settles on the cell `player` reports.                                                                                                              |
| 6  | Hold an arrow down                                        | The marker keeps walking. Holding into a wall repeats the bump.                                                                                               |
| 7  | Load `?seed=7`                                            | A different map.                                                                                                                                              |
| 8  | Run `game.state` in the console                           | Plain data: `seed`, `player`, `inventory`, and `changedCells`. No terrain list.                                                                               |
| 9  | Press an arrow several times                              | Position and Terrain in the panel change as each step plays, and never ahead of the marker.                                                                   |
| 10 | Make the window short, then press the down arrow          | The page does not scroll. The marker moves.                                                                                                                   |
| 11 | Click the sound button, then press an arrow               | The button reads `Sound: off`, and the arrow still moves the marker.                                                                                          |
| 12 | Click the sound button again                              | The button reads `Sound: on`, and you hear a two-note chime.                                                                                                  |
| 13 | Tab to the sound button and press Space                   | It toggles. Arrow keys still move the marker.                                                                                                                 |
| 14 | Listen while walking and bumping (headphones or speakers) | A soft tick on each step, and a low buzz on each bump. **This is the only check that a person can hear them.**                                                |
| 15 | On a high-resolution display, or at browser zoom 200%     | Grid edges stay sharp. The marker stays centered. Run `document.querySelector("canvas").width`: it is the canvas `clientWidth` times `devicePixelRatio`.      |

## Gathering

Reload with `?seed=121` before this sequence. Check the visible inventory panel and compare its counts with `game.state.inventory` in the console after animations settle.

| Action                                                              | Expected observation                                                                                                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Press G on the starting cell                                        | The marker sways, a sound plays, and the live message names the gathered material. Its inventory count increases by one. The cell darkens and the terrain label says depleted. |
| Press G again after the animation                                   | The message says gathering failed because the cell is depleted. Inventory and changed cells remain unchanged.                                                                  |
| Move east once and press G                                          | The new cell yields its material and darkens. Both cells are recorded in changedCells.                                                                                         |
| Move west to the starting cell                                      | The cell remains dark and the terrain label still says depleted. Gathering there still fails.                                                                                  |
| Walk far enough that the starting cell leaves the view, then return | Its depleted appearance persists after the grid redraws.                                                                                                                       |
| Tap G during a walk, then release all keys                          | Gathering waits for the walk. The marker settles on the cell reported by game.state.player.                                                                                    |
| Mash arrows and G, then stop                                        | Animations finish in order; the marker settles on the core's player cell.                                                                                                      |
| Tab to the sound button and press Space or Enter                    | Sound toggles without gathering or changing inventory.                                                                                                                         |
| Use Ctrl, Command, or Alt with G                                    | No gather command is sent; browser shortcuts remain available.                                                                                                                 |

### Inventory, timing, and sound

| Action                                                                                                            | Expected observation                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reload the game                                                                                                   | The HTML inventory panel shows the starting item names and counts, matching `game.state.inventory`.                                              |
| Press G on a fresh cell                                                                                           | The correct visible item count increases by one as the gathering animation starts, never before it starts.                                       |
| Press G again on the depleted cell                                                                                | Visible inventory counts remain unchanged.                                                                                                       |
| Move to a fresh cell and gather                                                                                   | The panel updates the correct resource while retaining previously collected items and counts.                                                    |
| With sound enabled, gather successfully and then gather again on the depleted cell                                | Success and failure have distinguishable sounds. Have a person listen with speakers or headphones.                                               |
| Temporarily set `WALK_MS` in `game/grid/grid_view.ts` to `3000`, reload, tap an arrow, then tap G during the walk | The inventory stays unchanged during the walk and updates only when the queued gathering animation starts. Restore `WALK_MS` to `120` afterward. |
