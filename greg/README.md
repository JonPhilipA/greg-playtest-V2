# G.R.E.G. — A Breath of Brass

A browser-based engineering adventure for **CSC 3501 — Computer Organization and Design**, Fall 2026. Repair the crashed spaceship KESTREL alongside its damaged maintenance AI, G.R.E.G., by building and diagnosing real digital circuits.

## Educational purpose

Learn through interacting with physical-looking switches, gates and equipment. The circuit evaluator follows the player's actual wires; expected answers do not replace missing connections. Verification and engaging a repair are separate actions.

After completing the implemented curriculum, players should be able to:

- Predict and verify NOT, AND, OR, NOR, NAND and XOR truth tables.
- Build equivalent logic, including NAND-only NOT/AND/OR and a De Morgan scrubber replacement.
- Interpret unsigned and two's-complement binary values, select suitable bit widths, and distinguish integer calculation from storage narrowing.
- Decode short ASCII messages using a reference and identify the null terminator.
- Construct half/full adders and connect four Full Adders through real carry links.
- Explain ADD4C, four parallel XOR lanes and replicated control signals, then build a four-bit adder/subtractor.
- Distinguish four-bit sum, unsigned carry/no-borrow and signed overflow.

**Current playtest scope:** the revised campaign is playable through P19, reaching Navigation Control. There are 29 planned numbered puzzles; P20–P29 are not presented as complete in this release. This package does not claim finished processor programming, pointers, arrays or later campaign endings.

## How to play

Open the deployed game link in a modern desktop browser. No download, account or installation is required. Landscape gives the clearest view; the game maintains a 16:9 viewport.

1. Choose **New Voyage**, watch or advance the opening with Enter/Space/click, and activate G.R.E.G.'s emergency switch.
2. Click the floor to walk, or click machinery to approach and inspect it. A/D or Left/Right selects one previous/next destination; hover near screen edges for brass navigation chevrons.
3. Collect glowing available parts. Open the relevant equipment panel.
4. Click or drag permitted components from the toolbox. Drag gate bodies to reposition them.
5. Drag between an output and an input terminal, in either direction. Round terminals are single-bit; square terminals carry four-bit buses. One output may feed multiple inputs.
6. Click a connected terminal to disconnect. Double-click a removable gate, drag it to the board's bin, or select it and click the bin to remove it and its wires. Fixed/special equipment remains protected. Inventory returns follow the existing ownership rules.
7. Use **Clear Panel**, **Truth Table**, **Test & Engage**, and **Hint**. Testing shows actual input/gate/output changes. **Engage System** commits a successful repair; testing alone does not complete it.
8. Open the **Engineering Manual** for earned references. Hints progress through four levels; explicitly revealed hints affect that puzzle's no-hints bonus. Reading the Manual or truth table does not grant parts or complete repairs.
9. Credits from legitimate repair engagement can buy engineer suits or G.R.E.G. shells in the pause menu's **Shop**. **Closet** equips owned appearances.

I opens Inventory, J opens the notebook, M toggles sound, and Escape closes an interface or opens Pause. Tab/Enter supports circuit terminals. Delete/Backspace removes a selected removable gate or wire. Mouse wheel or +/- zooms a circuit board; Alt-drag/middle-drag pans and 0 fits it. Settings include sound levels, Reduce Motion and native fullscreen. On supported sequential hardware, toggle CLOCK from 0 to 1 to capture; do not expect an automatic clock.

## Saving and updates

Progress saves automatically in this browser's local storage, including puzzles, physical inventory, Credits, purchases, appearances, positions and tutorials. Use the same browser profile and website origin to continue. An update at the same URL retains these storage keys and uses the game's save migration.

Clearing site data, private browsing expiry, changing browsers/devices or moving to another origin can lose access to that save. There are no accounts, cloud saves or cross-device synchronization. Two simultaneous voyage tabs are protected by a Web Locks writer lease; close the other tab before continuing. GitHub Pages uses HTTPS; local testing uses localhost. Browser storage and Web Locks must be available. Public playtest and final course hosting will normally have different origins, so progress does not automatically transfer between them. Different project paths on the **same** origin share local storage; avoid running separate independent G.R.E.G. copies there.

## Technical implementation and source

Native JavaScript ES modules, HTML, CSS, Canvas 2D, SVG and the Web Audio API. No framework, package download, external CDN, account service or application backend is needed at runtime. Audio is synthesized in the browser after a player gesture; no external audio files are missing.

`index.html` is the entry point; `js/` contains the actual readable game source, CSS files contain the styling source, and `assets/` contains the required artwork and data. These are unminified source files used directly by the browser, not a compiled-only bundle. See `SOURCE_NOTES.md` for the release/source arrangement. Developer tools and preview launch routes are disabled in this public package.

To test locally, serve this directory with any static HTTP server, for example `python -m http.server 8080`, and open `http://localhost:8080/`. Do not launch with `file://`, because native modules and fetched assets need HTTP(S). The development repository also provides a Pages-path test server and repeatable release command.

## Group members

Fill these fields before final course submission:

1. GROUP MEMBER 1 — TO BE FILLED IN
2. GROUP MEMBER 2 — TO BE FILLED IN
3. GROUP MEMBER 3 — TO BE FILLED IN
4. GROUP MEMBER 4 — TO BE FILLED IN
5. GROUP MEMBER 5 — TO BE FILLED IN

## Assets and credits

The runtime has no third-party JavaScript libraries, downloaded font dependencies or recorded sound libraries. Most illustrated SVG assets are generated by the project's own artwork scripts; sound effects and ambience are synthesized by its Web Audio code. The thumbnail is composed from the actual game scene and existing artwork.

The source repository does not contain a license granting reuse of the game as a whole. No third-party license or ownership claim is invented here. Provenance/licensing for any remaining provided raster artwork is not documented in the repository and should be confirmed by the team before final distribution. Development/testing tools are not included as game runtime dependencies.
