# Table of Contents

- [Development Environment](#development-environment)
- [Local Setup](#local-setup)
- [Repository Layout](#repository-layout)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
  - [General Principles](#general-principles)
  - [Module Guidelines](#module-guidelines)
- [Testing](#testing)
- [Debugging](#debugging)
- [Release Process](#release-process)
- [Refactoring Guidelines](#refactoring-guidelines)
- [Highlighting Engine](#highlighting-engine)
- [DOM Safety](#dom-safety)
- [Future Development](#future-development)

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
├── groupRenderer.js
├── groupHandlers.js
├── dragDrop.js
└── groupsManager.js
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
* Scope filtering
* Enable All Groups behavior
* Statistics panel updates

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

Before creating a release, verify:

```text
✓ CHANGELOG.md updated
✓ README.md updated
✓ DEVELOPMENT.md updated
✓ ARCHITECTURE.md updated
✓ manifest.json version updated
✓ update constant for profile version
✓ smoke test extension
□ create release commit
□ create version tag
□ publish GitHub release
```

Versioning roadmap:

```text
v1.0.0  Stable v1 before phrase engine

v1.1.0  Stable v1.1 before phrase engine

v1.2.0  Stable v1.2 before phrase engine

v1.3.0  Stable v1.3 with phrase engine

v1.4.0  Stable v1.4 before statistics dashboard

v1.5.0  Stable v1.5 with statistics dashboard
```

Example:

```bash
git add .
git commit -m "chore(release): prepare vX.Y.Z release"

git tag -a vX.Y.Z -m "Release vX.Y.Z"

git push origin main
git push origin vX.Y.Z
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
* Analytics Relevance Score display
* Build system adoption
* Content script modularization

Potential build systems:

* Vite
* Rollup
* esbuild
