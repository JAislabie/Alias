# Privacy Policy for Email Alias Hotkeys

Last updated: 2025-11-07

## Overview
Email Alias Hotkeys operates entirely on the user’s device. It generates and pastes plus-alias variants of an email address that the user configures.

## Data We Store
The extension stores the following settings using `chrome.storage.sync` so they are available across the user’s Chrome profiles that sync:
- Base email address
- Alias prefix
- Counter value

This data is stored locally and may sync via Chrome’s built-in sync infrastructure. We do not transmit this data to any external servers.

## Data We Do NOT Collect
We do NOT collect, transmit, or sell:
- Browsing history
- Page content
- Form contents (beyond inserting the generated alias when you request it)
- Personal information other than the email you provide for alias generation
- Analytics or usage metrics

## Permissions Justification
- `storage`: Store your alias configuration and counter.
- `scripting`: Temporarily inject a small content script into the active tab when you trigger a paste so it can insert the alias into the focused field.
- `activeTab`: Restricts operations to the tab you explicitly interact with (popup or hotkey).

The extension does not use host permissions or persistent content scripts and only injects code after a user action.

## Third-Party Services
No third-party services are called. There are no trackers, analytics, advertising, or external APIs.

## Clipboard
The extension no longer requests clipboard permissions and does not read or write clipboard contents.

## Network Requests
None. The extension does not perform outbound network requests.

## Security
Alias generation and counter increment happen locally. Avoid sharing sensitive personal emails if you do not wish them to be stored by Chrome sync.

## Removal of Data
To remove stored data:
1. Open the extension popup.
2. Clear the fields and counter.
3. Click Save.
Or remove the extension entirely from Chrome to delete its storage namespace.

## Changes to This Policy
Any future changes will update the date at the top of this file. Material changes will be noted in the project README.

## Contact
For questions or concerns, open an issue in the GitHub repository.

