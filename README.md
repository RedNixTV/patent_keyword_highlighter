<img width="378" height="584" alt="Screenshot 2026-05-25 at 6 44 55 PM" src="https://github.com/user-attachments/assets/2a3d668a-2117-4b1b-9b95-df5996221827" />

patent-highlighter/
│
├── manifest.json
├── popup.html      # popup structure only
├── popup.js        # UI behavior, state, rendering
├── content.js      # DOM highlighting engine
├── styles.css      # visual styling only
├── README.md    
├── CHANGELOG.md      

Architecture Philosophy

The project intentionally separates responsibilities:

content.js

Responsible only for:

DOM scanning
text matching
highlight rendering
highlight clearing

No UI logic.

popup.js

Responsible only for:

user interaction
state management
storage
messaging
rendering popup UI

manages groups
manages colors
manages storage
sends messages

No DOM page traversal logic.

What you currently have implemented:
	•	dynamic groups
	•	persistent storage
	•	collapse/expand
	•	enable/disable
	•	drag reorder
	•	preset colors
	•	custom colors
	•	DOM safe highlighting
	•	delete protection
	
# Patent Highlighter

A browser extension designed for fast patent and prior art scanning using dynamic keyword highlighting.

Built specifically for large patent pages such as:
- Google Patents
- FreePatentsOnline
- USPTO pages
- technical documentation
- research articles

The extension focuses on:
- speed
- readability
- workflow efficiency
- stable DOM rendering
- low false positives

---

# Current Features

## Dynamic Keyword Groups
Create multiple independent keyword groups for different invention concepts.

Examples:
- Base Device
- Functional Logic
- Technical Concepts
- AI / Machine Learning
- Materials
- Manufacturing

Each group supports:
- custom labels
- independent keyword sets
- independent colors

---

## Persistent Storage
All groups and settings are automatically saved using Chrome local storage.

The extension restores:
- keyword lists
- colors
- collapse state
- enabled state
- group ordering

after browser restart.

---

## Collapse / Expand Groups
Groups can be collapsed to reduce UI clutter during large invention searches.

Useful for:
- large synonym lists
- technical terminology
- exploratory keyword groups

---

## Enable / Disable Groups
Temporarily disable groups without deleting keywords.

Useful when:
- reducing visual noise
- testing terminology relevance
- comparing search strategies

---

## Drag Reorder
Groups can be reordered using drag and drop.

This helps organize:
1. core invention concepts
2. secondary terminology
3. exploratory concepts
4. weak relevance groups

---

## Preset + Custom Colors
Supports:
- preset highlight palettes
- custom color picker
- active color indication

Designed to improve fast visual scanning of patent pages.

---

## DOM Safe Highlighting
Uses:
- `TreeWalker`
- text node traversal
- `document.createElement("mark")`

instead of unsafe:
```js
innerHTML.replace()


Planned Features
Phrase Mode

Support:

"roof waste factor"
"machine learning"
"semantic segmentation"

in addition to single word matching.

Group Statistics

Potential metrics:

total matches
keyword density
phrase density
relevance scoring

