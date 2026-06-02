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

Select or create profile
↓
Enter keywords
↓
Save
↓
Highlight

Export profile
↓
Share or back up

Import profile
↓
Restore settings

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
## Search Profiles

Patent Highlighter supports named search profiles that can be saved, exported, imported, and reused across different inventions.

### Creating a Profile

Enter a profile name such as:

```text
Roof Estimation
Medical Device
Athletic Footwear
AI Systems
Construction Materials
```

Then configure keyword groups and click Save.

### Export Profile

Export saves all profile settings to a JSON file, including:

* Profile name
* Keyword groups
* Colors
* Labels
* Auto Highlight setting
* Match Whole Word Only setting

Example:

```text
Roof Estimation.json
```

Example JSON:

```json
{
  "profileName": "Roof Estimation",
  "version": "1.2.0",
  "groups": [...],
  "autoHighlight": true,
  "wholeWordOnly": false
}
```

### Import Profile

Import restores a previously exported profile.

Imported settings include:

* Profile name
* Keyword groups
* Group colors
* Group labels
* Auto Highlight setting
* Match Whole Word Only setting

This allows researchers to quickly switch between invention specific search environments.

### Example Workflow

```text
Import Roof Estimation.json
↓
Search roofing inventions

Import Medical Device.json
↓
Search medical inventions

Import AI Systems.json
↓
Search software inventions
```

Profiles can also be shared with teammates, researchers, and trainees.
--
## Patent Profile Analytics

Patent Highlighter includes a floating analytics panel that appears directly on the patent page after highlighting is completed.

The panel helps researchers quickly evaluate whether a reference is worth deeper review.

### Analytics Display

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

### Features

* Per group match counting
* Total match counting
* Percentage based analysis
* Automatic sorting by match frequency
* Group color visualization
* Draggable interface
* Position persistence across page refreshes
* Collapse and expand support
* Close button support

### Research Benefits

The analytics panel transforms keyword highlighting into a patent triage workflow.

Researchers can quickly determine:

* Which concepts dominate a reference
* Whether an invention aligns with the active search profile
* Which technical areas receive the most discussion
* Whether a patent merits detailed review

This significantly reduces time spent reviewing low relevance references.


## Project Structure

```text
patent-highlighter/
│
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── constants.js
├── storage.js
├── profiles.js
├── settings.js
├── importExport.js
├── saveReset.js
├── style.css
├── README.md
├── CHANGELOG.md
│
└── ui/
    ├── groupRenderer.js
    ├── dragDrop.js
    └── groupHandlers.js
```

---

## Architecture Philosophy

The project intentionally separates responsibilities.

### Separation of Concerns

The extension follows a modular architecture:

constants.js
    Configuration and versioning

storage.js
    Storage persistence and migrations

profiles.js
    Profile management and import/export
    
settings.js
    Settings UI management
    
importExport.js
    Profile import/export event handling

popup.js
    Application orchestration

ui/groupRenderer.js
    Group rendering and markup generation

ui/dragDrop.js
    Group drag and drop behavior

ui/groupHandlers.js
    Group event handlers

content.js
    Page analysis and highlighting


### manifest.json

Responsible for:

* Permissions
* Content script loading

### popup.html

Responsible for:

* Popup layout
* Buttons
* Form controls

### constants.js

Current Structure

├── DEFAULT_GROUPS
├── PRESET_COLORS
├── STORAGE_VERSIONS
└── PROFILE_VERSION

Responsible for:

Default group definitions
Preset color definitions
Storage version definitions
Current profile version

No UI or storage logic.

### storage.js

Current Structure

├── loadGroups()
├── saveGroups()
├── loadSettings()
├── saveSettings()
└── runMigrations()

Responsible for:

* Chrome storage access
* Settings persistence
* Group persistence
* Storage migrations

No UI logic.

### profiles.js

Current Structure

├── createProfileData()
├── createProfileBlob()
├── createProfileFileName()
├── parseProfileFile()
├── validateProfile()
├── migrateProfile()
├── loadAllProfiles()
├── saveAllProfiles()
├── loadProfile()
├── saveProfile()
├── importProfile()

Responsible for:

* Profile creation
* Profile validation
* Profile migration
* Profile import
* Profile export utilities
* Profile persistence

No UI logic.

### settings.js

Current Structure

├── initializeSettings()
├── initializeAutoHighlight()
├── initializeWholeWordOnly()
├── initializeToggleLabel()
├── loadProfileName()
├── saveProfileName()
├── applySettingsToUI()
└── resetSettingsUI()

Responsible for:

* Settings UI initialization
* Auto Highlight behavior
* Match Whole Word Only behavior
* Active / Inactive label updates
* Profile name UI management
* Settings UI updates
* Settings UI reset behavior

No storage logic.
No group management.

### importExport.js

Current Structure

├── setupExportHandler()
└── setupImportHandler()

Responsible for:

* Profile export workflow
* Profile import workflow
* Import/export button handlers
* Import file processing
* Profile UI updates after import

No group rendering logic.
No storage implementation.
No drag and drop logic.

### saveReset.js

Current Structure

├── setupSaveHandler()
└── setupResetHandler()

Responsible for:

* Save button workflow
* Reset button workflow
* Chrome message dispatching
* Settings reset behavior

No rendering logic.
No group event handling.
No drag and drop logic.

### popup.js

Current Structure

├── group orchestration
└── application startup

Responsible for:

* Application orchestration
* Group lifecycle management
* Save workflow
* Reset workflow
* Communication with content scripts

No rendering logic.
No drag and drop logic.
No group event implementation.

### content.js

Responsible for:

* DOM scanning
* Text matching
* Highlight rendering
* Highlight clearing
* Regex caching

No UI logic.

---

### ui/groupRenderer.js

Current Structure

├── createPresetButtons()
├── createGroupMarkup()
└── renderGroups()

Responsible for:

* Group markup generation
* Preset color rendering
* Group rendering

No storage logic.
No event implementation.

### ui/dragDrop.js

Current Structure

└── attachDragHandlers()

Responsible for:

* Group drag start
* Group drag end
* Group drag over
* Group drop
* Group reordering

No rendering logic.
No storage management.

### ui/groupHandlers.js

Current Structure

├── setupCollapseHandler()
├── setupDeleteHandler()
├── setupEnabledHandler()
├── setupLabelHandler()
├── setupKeywordsHandler()
├── setupColorHandler()
├── setupPresetColorHandler()
└── createGroupHandlers()

Responsible for:

* Group event registration
* Collapse behavior
* Delete behavior
* Enable/disable behavior
* Label updates
* Keyword updates
* Color updates

No rendering logic.

settings.js
├── initializeSettings()
├── initializeAutoHighlight()
├── initializeWholeWordOnly()
├── initializeToggleLabel()
├── loadProfileName()
└── saveProfileName()

## Current Features

### Search Profile Management

* Dynamic groups
* Named search profiles
* Profile import
* Profile export
* Persistent storage
* Collapse / expand groups
* Enable / disable groups
* Drag reorder groups
* Preset colors
* Custom colors

### Highlighting Engine

* Active toggle
* Match whole word only
* Save workflow
* Reset workflow
* Regex caching
* DOM safe highlighting
* Delete protection

### Patent Analytics

* Patent profile analytics panel
* Per group match statistics
* Total match counting
* Percentage based match analysis
* Group color visualization
* Automatic sorting by match frequency
* Draggable analytics panel
* Persistent analytics panel position
* Analytics panel collapse / expand
* Analytics panel close button

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

### Continued UI Refinement

Future improvements may include:

* Additional UI modules
* Reusable form components
* Validation helpers
* Improved profile management workflows
* Further popup.js simplification

### Phrase Mode

Support for multi word concepts such as:

* "roof waste factor"
* "machine learning"
* "semantic segmentation"
* "neural network"

Phrase matching will work alongside existing keyword highlighting.

### Search Profile Library

Future support for:

* Multiple saved profiles
* Quick profile switching
* Built in profile templates
* Profile sharing

### Advanced Patent Analytics

Potential future metrics:

* Keyword density scoring
* Phrase density scoring
* Coverage analysis
* Concept clustering
* Patent comparison metrics
* Exportable analytics reports
