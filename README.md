# Email Alias Hotkeys

Quickly paste plus-addressed ("+alias") variants of your base email using keyboard shortcuts or popup buttons.

## Features
- Current or incremented alias paste (Alt+Shift+1 / Alt+Shift+2 by default)
- Atomic counter increments to avoid race conditions
- Fallback to clipboard copy on restricted pages
- Manual paste buttons in popup (Paste Current / Paste Next)
- Live preview of current & next alias
- Accessible form with status announcements
- Dark mode styling

## Usage
1. Open the extension popup and fill Base Email, Alias Prefix, and starting Counter.
2. Press Save.
3. Use shortcuts (configure in `chrome://extensions/shortcuts`).
4. Optional: Use popup buttons for manual pasting.

## Permissions
- storage: persists settings
- tabs: determine active tab URL
- scripting: inject content script & clipboard fallback
- clipboardWrite: copy alias when direct paste not possible

## Development Notes
- Shared utilities in `utils/` unify alias construction and storage access.
- Background script is a module (MV3) and listens for both command and popup messages.
- Content script responds to ping for injection optimization.

## Future Enhancements
- Narrow `<all_urls>` host permissions
- Add history/list of previously used aliases
- Setting for overwrite vs insert mode in inputs
- Optional auto-increment after each paste

## Building / Loading
No build step required. Load the folder as an unpacked extension in Chrome (Developer Mode > Load Unpacked).

## License
MIT (add license text if desired).
