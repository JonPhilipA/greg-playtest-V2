# Source included in this package

G.R.E.G. runs its readable JavaScript ES-module source directly from `js/`, together with the CSS and HTML in this directory. There is no transpilation or minification step and no separate compiled application bundle hiding the source. SVG artwork remains readable SVG source.

The release command copies the required source and artwork, writes a production-only `js/build-info.js`, and replaces the developer-loader module with a disabled stub. `PUBLIC_RELEASE=true` fixes the launch mode to the current normal curriculum; URL switches cannot select developer, demo, inventory-pilot or environment/presentation preview modes.

The full development repository also contains tests, artwork-generation tools, historical snapshots and design records. They are not required to run this browser game and are deliberately excluded from the 35 MB course directory. No `node_modules`, development fixtures, developer save manipulation, local server, repository credentials or Git history is distributed.

The surrounding playtest site's `.nojekyll` belongs only to a separate static playtest repository. Do not copy that file to the professor's repository root: the course gallery uses Jekyll. Submit this game directory and append its proposed YAML entry to the course's existing `_data/games.yml`.
