<img width="378" height="584" alt="Screenshot 2026-05-25 at 6 44 55 PM" src="https://github.com/user-attachments/assets/2a3d668a-2117-4b1b-9b95-df5996221827" />

# Patent Highlighter

A browser extension designed for fast patent and prior art scanning using dynamic keyword highlighting.

Built specifically for:

* Google Patents
* FreePatentsOnline
* USPTO pages
* Technical documentation
* Research articles

The extension focuses on:

* Speed
* Readability
* Workflow efficiency
* Stable DOM rendering
* Low false positives

---

## User Workflow

### First Time Setup

Active is enabled by default.

```text
Open extension
↓
Enter keywords
↓
Save
↓
Highlights appear
```

### Daily Usage

```text
Install extension
↓
Active ON

Enter keywords
↓
Save
↓
Highlight

Toggle Match Whole Word Only
↓
Highlights update immediately

Refresh page
↓
Highlight

Open new patent
↓
Highlight

Toggle OFF
↓
Clear

Toggle ON
↓
Highlight

Reset
↓
Delete keywords
↓
Restore defaults
↓
Clear page
↓
Active ON
```

---

## Match Whole Word Only

By default, keyword matching is broad.

Keyword:

```text
roof
```

Matches:

```text
roof
roofs
roofing
rooftop
```

Enable **Match Whole Word Only** to require exact word matches.

Keyword:

```text
roof
```

Matches:

```text
roof
```

Does not match:

```text
roofs
roofing
rooftop
```

This option is useful when searching for exact terminology and reducing false positives.

## How Highlighting Works

When Save is clicked:

```text
Popup
↓
sendMessage()
↓
content.js
↓
TreeWalker
↓
Highlights appear
↓
create <mark> elements
```

The highlight engine modifies the current page DOM by inserting `<mark>` elements around matching keywords.

Example:

Before:

```html
The roof contains multiple facets.
```

After:

```html
The <mark>roof</mark> contains multiple <mark>facets</mark>.
```

Highlights only exist in the current page DOM and are recreated automatically when Auto Highlight is active.

---

## Active Toggle

The Active toggle controls whether highlights are visible.

### Active ON

```text
Highlights automatically appear
on page load and refresh.
```

### Active OFF

```text
Highlights are removed
from the current page.
```

Keywords and settings remain saved.

---

## Save

Save performs two actions:

1. Stores all group settings in Chrome local storage.
2. Refreshes highlighting on the current page.

Save is the primary action users perform after editing keywords.

---

## Reset

Reset performs the following actions:

* Removes all highlights from the current page.
* Deletes all saved keywords.
* Restores default groups.
* Leaves Active enabled.

After Reset, users can immediately begin entering new keywords.

---

## Project Structure

```text
patent-highlighter/
│
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── style.css
├── README.md
├── CHANGELOG.md
```

---

## Architecture Philosophy

The project intentionally separates responsibilities.

### manifest.json

Responsible for:

* Permissions
* Content script loading

### popup.html

Responsible for:

* Popup layout
* Buttons
* Form controls

### popup.js

Responsible for:

* User interaction
* State management
* Chrome storage
* Messaging
* Rendering popup UI

No page traversal logic.

### content.js

Responsible for:

* DOM scanning
* Text matching
* Highlight rendering
* Highlight clearing
* Regex caching

No UI logic.

---

## Current Features

* Dynamic groups
* Persistent storage
* Active toggle
* Match whole word only
* Save workflow
* Reset workflow
* Collapse / expand
* Enable / disable groups
* Drag reorder
* Preset colors
* Custom colors
* Regex caching
* DOM safe highlighting
* Delete protection

---

## DOM Safe Highlighting

Uses:

* TreeWalker
* Text node traversal
* document.createElement("mark")

instead of:

```js
innerHTML.replace(...)
```

This avoids breaking page structure and improves compatibility with large patent pages.

---

## Planned Features

### Phrase Mode

Support for:

* "roof waste factor"
* "machine learning"
* "semantic segmentation"

in addition to single-word matching.

### Group Statistics

Potential metrics:

* Total matches
* Keyword density
* Phrase density
* Relevance scoring
