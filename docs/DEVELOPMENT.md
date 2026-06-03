# Development Guide

## Purpose

This document explains how to develop, test, maintain, and release Patent Highlighter.

For system design, architecture decisions, and module responsibilities, see `ARCHITECTURE.md`.

---

# Development Environment

## Requirements

* Google Chrome
* Git
* JavaScript (ES6+)
* Text editor or IDE

Recommended:

* Visual Studio Code
* Chrome Developer Tools

---

# Local Setup

Clone the repository:

```bash
git clone <repository-url>
```

Open Chrome:

```text
chrome://extensions
```

Enable:

```text
Developer Mode
```

Select:

```text
Load Unpacked
```

Choose:

```text
patent-highlighter/
```

The extension should now be available in Chrome.

---

# Repository Layout

```text
patent-highlighter/

manifest.json
popup.html
popup.js
content.js
constants.js
storage.js
profiles.js
settings.js
importExport.js
saveReset.js
style.css

ui/
```

Detailed module responsibilities are documented in `ARCHITECTURE.md`.

---

# Development Workflow

Typical workflow:

```text
Modify Code
↓
Reload Extension
↓
Refresh Browser Page
↓
Verify Behavior
↓
Review Console Output
↓
Commit Changes
```

---

# Coding Standards

## General Principles

* One responsibility per module
* Keep functions focused
* Avoid duplicated logic
* Prefer explicit naming
* Minimize coupling between modules
* Separate UI from business logic

## Module Guidelines

### UI Modules

Should:

* Render UI
* Attach event handlers
* Manage visual state

Should not:

* Perform storage operations
* Execute migrations
* Validate profiles

### Storage Modules

Should:

* Manage persistence
* Manage settings storage
* Handle migrations

Should not:

* Render UI
* Attach DOM listeners

### Profile Modules

Should:

* Create profiles
* Validate profiles
* Import and export profiles
* Handle profile migrations

Should not:

* Render UI
* Manipulate DOM elements

---

# Testing

## Highlighting

Verify:

* Keywords highlight correctly
* Whole word matching behaves correctly
* Save refreshes highlighting
* Reset clears highlighting
* Auto highlight functions correctly

## Profiles

Verify:

* Export functionality
* Import functionality
* Profile migration compatibility
* Profile version handling

## Analytics

Verify:

* Match counts
* Percentages
* Sorting behavior
* Dragging functionality
* Position persistence
* Collapse and expand behavior

---

# Debugging

## Chrome Extension Tools

Extension Management:

```text
chrome://extensions
```

Popup Debugging:

```text
Inspect Popup
```

Content Script Debugging:

```text
Inspect Page
→ Console
```

Storage Inspection:

```javascript
chrome.storage.local.get(null, console.log);
```

---

# Release Process

Before creating a release:

1. Update CHANGELOG.md
2. Update manifest.json version
3. Update profile version if required
4. Verify extension functionality
5. Commit release changes
6. Create Git tag
7. Publish GitHub release

Example:

```bash
git tag v1.2.0
git push origin v1.2.0
```

---

# Refactoring Guidelines

When extracting functionality:

1. Identify a single responsibility
2. Create a focused module
3. Move implementation
4. Export public APIs
5. Update imports
6. Verify behavior
7. Update documentation

Preferred extraction order:

```text
Constants
↓
Storage
↓
Profiles
↓
Settings
↓
Feature Modules
↓
UI Modules
```

---

# Highlighting Engine

Current highlighting flow:

```text
Popup
↓
sendMessage()
↓
content.js
↓
TreeWalker
↓
Text Node Processing
↓
<mark> Elements
↓
Analytics Refresh
```

Highlights are applied using DOM safe text node traversal rather than string replacement.

---

# DOM Safety

Patent Highlighter uses:

* TreeWalker
* Text node traversal
* document.createElement("mark")

instead of:

```javascript
innerHTML.replace(...)
```

This preserves page structure and improves compatibility with large patent documents.

---

# Future Development

Planned areas:

* Phrase matching
* Search profile library
* Enhanced analytics
* Build system adoption
* Content script modularization

Potential build systems:

* Vite
* Rollup
* esbuild
