G.R.E.G. - A Breath of Brass
PROFESSOR REVIEW PREVIEW
Local source checkpoint: 3eb47f8

This playable preview includes the latest implemented campaign, artwork,
tutorials, puzzles, dialogue, Engineering Manual, and existing Developer Mode.
Planned curriculum entries remain marked as planned and unavailable.
This is an interim review build.

QUICK START - WINDOWS 10 / 11
1. Extract the entire ZIP to a folder. Do not launch from inside the ZIP.
2. Double-click "Launch GREG.cmd".
3. The game opens in your default browser. Keep the launcher window open.
   The launcher uses Windows PowerShell and built-in .NET libraries.
   No Node.js, npm, or development dependencies are needed.
4. If the browser does not open, visit:
   http://127.0.0.1:48731/?curriculum=1
5. Close the launcher window or press Ctrl+C when finished.

NORMAL CAMPAIGN
On the title screen, click to open the menu, then choose NEW VOYAGE to begin
a new campaign. CONTINUE resumes an existing preview campaign.
A/D or the arrow keys walk between stops. You can also click the floor and
equipment. The in-game Menu includes fullscreen and other player controls.

DEVELOPER MODE - JUMP TO PUZZLES
Double-click "Open Developer Mode.cmd". If the preview is already running,
this opens its Developer Mode in another browser tab.
Or visit:
http://127.0.0.1:48731/?curriculum=1&dev=1

In the Developer Mode panel:
1. Select the Puzzles tab.
2. Select a puzzle by its P-number and name. Search narrows the list.
3. Click JUMP TO PUZZLE.
   Implemented puzzles load with their prerequisite repairs and required
   components prepared in an isolated developer campaign.
   An introductory conversation may appear first. Press CONTINUE, then
   click the workstation in the room to open it.
4. Use the normal puzzle controls to build, test, and engage.
5. Click the DEV MODE badge at the upper left to reopen the panel.
6. Rooms allows direct environment navigation.
7. EXIT DEV MODE returns to the normal campaign on the same preview.
   Your normal campaign and Developer Mode use separate save slots.

The current Revised Curriculum is selected by both launchers. Implemented
legacy puzzles and rooms remain included. To inspect the Legacy campaign,
use the existing "Start legacy compatibility developer session" control in Developer Mode's Testing tab.
Planned/unimplemented puzzles cannot be launched.

SAVES AND PRIVACY
Saves stay in your browser on this computer. No account or network service
is required. Keep the same browser and address to resume.
This preview uses its own port, separate from the development game's ports.
Developer Mode writes only its dedicated developer save slots. It preserves
the normal campaign slots. No saved games are included in this ZIP.
Use EXIT DEV MODE or the normal launcher to return to ordinary play.
If you open a normal campaign in a second tab, continue it in only one tab
at a time because the game protects save ownership.

OPTIONAL - MAC / LINUX OR PYTHON USERS
If Python 3 is already installed, open a terminal in this extracted folder:
    python3 serve_preview.py
For Developer Mode:
    python3 serve_preview.py --dev
Windows users with Python can use "python" instead of "python3".
Use one server launcher at a time. Both methods use the same preview port.

TROUBLESHOOTING
- Extract all files together, including the game subfolder.
- Open the localhost address through a launcher, rather than game/index.html.
- If the port is occupied by another preview instance, reuse its browser
  address or close its launcher window.
- If Windows asks about a downloaded launcher, use your institution's
  normal process for reviewing downloaded files. The optional Python method
  serves the identical packaged game.
- Modern Chrome, Edge, or Firefox is recommended. Click inside the game
  to enable sound if your browser initially blocks audio.

All changes enabling Developer Mode are confined to this preview copy.
The original development checkout and separate public release are untouched.
