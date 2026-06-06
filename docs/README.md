# Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Search Profile Management](#search-profile-management)
  - [Highlighting Engine](#highlighting-engine)
  - [Patent Analytics](#patent-analytics)
- [Installation](#installation)
- [Usage](#usage)
- [Search Profiles](#search-profiles)
- [Patent Analytics](#patent-analytics)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

# Patent Highlighter

A Chrome extension designed for fast patent and prior art review through dynamic keyword highlighting, search profiles, and patent analytics.

Built for:

* Google Patents
* FreePatentsOnline
* USPTO
* Technical documentation
* Research articles

---

# Overview

Patent Highlighter helps researchers quickly identify relevant concepts within patents and technical documents.

Instead of manually scanning large references, users can create keyword groups, assign colors, save reusable search profiles, and instantly visualize concept coverage across a document.

The extension is designed for:

* Patentability searches
* Prior art review
* Technical literature review
* Competitive intelligence
* Research and development workflows

---

# Features

## Search Profile Management

* Dynamic keyword groups
* Named search profiles
* Import and export profiles
* Persistent storage
* Group enable and disable controls
* Group collapse and expand controls
* Drag and drop group ordering
* Preset and custom colors

## Highlighting Engine

* Dynamic keyword highlighting
* Match Whole Word Only option
* Active / Inactive toggle
* Save workflow
* Reset workflow
* Automatic page refresh highlighting
* Single Word mode
* Phrase mode
* Per group coverage tracking
* Structural weighting
* Critical group tracking

## Patent Analytics

Patent Highlighter includes a floating analytics panel that supports both Single Word and Phrase analysis.

Features:

* Keyword coverage metrics
* Structural scoring
* Critical group tracking
* Per group hit counts
* Per group keyword frequencies
* Expandable keyword breakdowns
* Scope based analysis
* Patent section filtering
* Draggable and persistent analytics panel

Example:

Portable Projection / Display
12/14 (86%) | 447 hits

Structural: 24/30
Critical: 3/4

* Floating analytics panel
* Per group match counts
* Total match counts
* Percentage based analysis
* Automatic sorting by frequency
* Group color visualization
* Draggable interface
* Position persistence
* Collapse and expand support
* Patent section filtering
* Scope based analysis (Entire Patent, Biblio, Claims)
* Enable All Groups support

---

# Installation

## Chrome Extension Installation

1. Clone or download the repository.
2. Open Chrome.
3. Navigate to:

```text
chrome://extensions
```

4. Enable:

```text
Developer Mode
```

5. Click:

```text
Load Unpacked
```

6. Select the project folder.

The extension will now appear in Chrome.

---

# Usage

## Basic Workflow

```text
Open Extension
↓
Create or Select Profile
↓
Enter Keywords
↓
Save
↓
Highlight Patent
↓
Review Analytics
```

## Match Whole Word Only

By default, matching is broad.

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

When Match Whole Word Only is enabled:

```text
roof
```

matches only:

```text
roof
```

This reduces false positives when searching for exact terminology.

## Save

Save performs two actions:

1. Stores current settings.
2. Refreshes highlighting on the active page.

## Reset

Reset:

* Clears highlights
* Removes saved keywords
* Restores default groups
* Leaves Active enabled

---

# Search Profiles

Search profiles allow researchers to save and reuse invention specific keyword configurations.
Profiles exported from older versions are automatically migrated when possible.

Examples:

```text
Roof Estimation
Medical Device
Athletic Footwear
AI Systems
Construction Materials
```

Profiles support:

* Import
* Export
* Versioning
* Reuse across projects
* Team sharing

Example export:

```json
{
  "profileName": "Roof Estimation",
  "version": "1.2.0",
  "groups": [...],
  "autoHighlight": true,
  "wholeWordOnly": false
}
```

---

# Patent Analytics

Patent Highlighter includes a floating analytics panel that summarizes keyword activity within a reference.

Example:

```text
Patent Profile Match

Computer Vision / AI ............. 147 (37%)
Complexity / Classification ...... 125 (31%)
Roof Geometry Extraction ......... 54 (14%)
Roof Complexity Indicators ....... 30 (8%)
Estimation / Waste ............... 23 (6%)
Image Acquisition ................ 18 (4%)

Total Matches: 397
```

Benefits:

* Faster patent triage
* Concept coverage analysis
* Search profile validation
* Reduced review time
* Improved reference prioritization

---

# Project Structure

```text
patent-highlighter/

popup.js
    Application orchestration

content.js
    Highlighting and analytics engine

constants.js
    Shared constants and version management

storage.js
    Storage and migrations

profiles.js
    Profile import/export helpers

settings.js
    Settings management

importExport.js
    Import/export workflow

saveReset.js
    Save/reset workflow

ui/
├── groupRenderer.js
├── groupHandlers.js
├── dragDrop.js
└── groupsManager.js
```

For architecture details see:

```text
ARCHITECTURE.md
```

For development information see:

```text
DEVELOPMENT.md
```

---

# Roadmap

## Planned Features

### Phrase Matching

Support for multi word concepts:

* machine learning
* semantic segmentation
* neural network
* roof waste factor

### Search Profile Library

* Multiple saved profiles
* Profile templates
* Faster profile switching
* Team profile sharing

### Advanced Analytics

* Keyword density scoring
* Phrase density scoring
* Coverage analysis
* Concept clustering
* Patent comparison metrics
* Exportable reports

### Build System

Potential future migration to:

* Vite
* Rollup
* esbuild

to support further modularization of the content script.
