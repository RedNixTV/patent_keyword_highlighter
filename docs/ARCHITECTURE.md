# Table of Contents

- [Architectural Goals](#architectural-goals)
- [System Overview](#system-overview)
  - [Popup Application](#popup-application)
  - [Content Script](#content-script)
- [Architectural Boundaries](#architectural-boundaries)
  - [UI Layer](#ui-layer)
  - [Configuration Layer](#configuration-layer)
  - [Storage Layer](#storage-layer)
  - [Profile Layer](#profile-layer)
  - [Content Layer](#content-layer)
- [Runtime Architecture](#runtime-architecture)
  - [Settings Flow](#settings-flow)
  - [Highlighting Flow](#highlighting-flow)
- [Dependency Model](#dependency-model)
  - [Core Dependency Diagram](#core-dependency-diagram)
- [Module Responsibilities](#module-responsibilities)
  - [constants.js](#constantsjs)
  - [storage.js](#storagejs)
  - [profiles.js](#profilesjs)
  - [settings.js](#settingsjs)
  - [importExport.js](#importexportjs)
  - [saveReset.js](#saveresetjs)
  - [popup.js](#popupjs)
  - [content.js](#contentjs)
- [Repository Structure](#repository-structure)
- [Future Architecture](#future-architecture)
- [Refactor Status](#refactor-status)

# Patent Highlighter Architecture

## Purpose

This document describes the technical architecture of Patent Highlighter, including system boundaries, component responsibilities, runtime behavior, and future architectural direction.

For development workflows, testing, and release procedures, see `DEVELOPMENT.md`.

---

# Architectural Goals

Patent Highlighter is designed around several core goals:

* Maintainability
* Separation of concerns
* Low coupling
* Incremental refactoring
* Future modularization

The architecture favors small focused modules with clearly defined responsibilities.

---

# System Overview

Patent Highlighter consists of two independent execution environments.

## Popup Application

Runs inside the browser extension popup.

Responsibilities:

* Profile management
* Settings management
* Group management
* Import and export workflows
* Save and reset workflows

Primary entry point:

```text
popup.js
```

---

## Content Script

Runs inside patent and technical document pages.

Responsibilities:

* DOM scanning
* Keyword matching
* Highlight rendering
* Analytics calculations
* Analytics rendering

Primary entry point:

```text
content.js
```

---

# Architectural Boundaries

## UI Layer

Files:

```text
popup.html
popup.js
settings.js
saveReset.js
importExport.js
ui/*
```

Responsibilities:

* User interaction
* Event handling
* Visual rendering

Must not:

* Execute migrations
* Manage persistence internals

---

## Storage Layer

Files:

```text
storage.js
```

Responsibilities:

* Settings persistence
* Group persistence
* Storage migrations

Must not:

* Render UI
* Attach event handlers


## Configuration Layer

Files:

constants.js

Responsibilities:

* Default groups
* Preset colors
* Storage versions
* Profile versions

Must not:

* Access storage
* Render UI
* Manipulate profiles

---

## Profile Layer

Files:

```text
profiles.js
```

Responsibilities:

* Profile creation
* Profile validation
* Import and export
* Version migration

Must not:

* Render UI
* Manipulate DOM elements

---

## Content Layer

Files:

```text
content.js
```

Responsibilities:

* Keyword highlighting
* Phrase highlighting
* Analytics generation
* Structural scoring
* Critical group scoring
* Coverage calculation
* Keyword frequency tracking
* Scope based analysis
* Analytics panel rendering
* Analytics panel persistence
* Coverage based structural evaluation

Must not:

* Manage popup state
* Manage profile persistence

---

# Runtime Architecture

## Settings Flow

```text
User
↓
popup.js
↓
settings.js
↓
storage.js
↓
chrome.storage.local
```

---

## Highlighting Flow

```text
User
↓
Save Button
↓
saveReset.js
↓
chrome.runtime.sendMessage()
↓
content.js
↓
Highlight Engine
↓
Analytics Engine
↓
Analytics Panel
```

---

# Dependency Model

## Core Dependency Diagram

```text
popup.js
│
├── settings.js
├── saveReset.js
├── importExport.js
├── storage.js
├── profiles.js
│
└── ui/
    ├── groupsManager.js
    ├── groupRenderer.js
    ├── dragDrop.js
    └── groupHandlers.js
```

Content script:

```text
content.js
│
├── Regex Cache
├── Highlight Engine
├── Analytics Engine
└── Analytics UI
```

---

# Module Responsibilities

## constants.js

Responsibilities:

* Default configuration
* Color definitions
* Version constants

Dependencies:

* None

---

## storage.js

Responsibilities:

* Chrome storage access
* Persistence
* Migration handling

Dependencies:

```text
constants.js
```

---

## profiles.js

Responsibilities:

* Profile lifecycle management
* Validation
* Import and export
* Migration

Dependencies:

```text
constants.js
storage.js
```

---

## settings.js

Responsibilities:

* Settings initialization
* Settings UI synchronization
* Toggle management

Dependencies:

storage.js
constants.js

---

## importExport.js

Responsibilities:

* Import workflows
* Export workflows
* File handling

---

## saveReset.js

Responsibilities:

* Save workflow
* Reset workflow
* Message dispatching

---

## popup.js

Responsibilities:

* Application startup
* Module initialization
* High level orchestration

Not responsible for:

* Persistence
* Rendering implementation
* Validation

---

## content.js

Responsibilities:

* DOM traversal
* Matching
* Highlight rendering
* Analytics generation
* Coverage based group matching
* Structural qualification logic

Current Status:

Standalone content script.

Because Chrome content scripts are loaded through `manifest.json`, the file remains monolithic until a build process is introduced.

---

# Repository Structure

```text
patent-highlighter/
│
├── popup.js
├── content.js
├── storage.js
├── profiles.js
├── settings.js
├── importExport.js
├── saveReset.js
├── constants.js
│
└── ui/
```

---

# Future Architecture

The long term direction is further decomposition of the content script into independent modules.

Target structure:

```text
src/
├── analytics/
├── content/
├── highlighting/
├── profiles/
├── storage/
└── ui/
```

Likely build systems:

* Vite
* Rollup
* esbuild

These tools would bundle multiple modules into a single Chrome content script.

---

# Refactor Status

Completed:

```text
✓ constants.js
✓ storage.js
✓ profiles.js
✓ settings.js
✓ importExport.js
✓ saveReset.js
✓ groupsManager.js
✓ groupRenderer.js
✓ dragDrop.js
✓ groupHandlers.js
```

Remaining:

□ content.js modularization
□ analytics module extraction
□ highlighting module extraction
□ build system adoption
