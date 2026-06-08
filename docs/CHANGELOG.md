# Changelog
## v1.3.0 (2026-06-05)

Phrase Engine, Structural Analytics, and Coverage Metrics

### Added

* Phrase matching mode
* Single Word and Phrase analytics tabs
* Structural weighting system
* Critical group support
* Keyword coverage analytics
* Per group coverage percentages
* Group keyword frequency breakdown
* Expand / collapse analytics groups
* Analysis scope persistence
* Analytics panel mode synchronization

### Improved

* Analytics panel visibility and z-index handling
* Analytics panel positioning reliability
* Patent relevance review workflow
* Profile schema support for phrases, weights, and critical groups
* Structural scoring now uses keyword coverage instead of raw hit thresholds
* Patent relevance evaluation is less sensitive to repeated keyword occurrences

### Refactored

* Profile schema upgraded to v1.3.0
* Storage migrations extended for phrase and structural analytics support

## v1.2.0 (2026-06-03)

Analytics, Profiles, and Architecture Refactor

### Added

* Patent Profile Analytics panel
* Patent relevance scoring and match statistics
* Named search profiles
* Profile import and export support
* Patent section filtering
* Statistics panel scope selector
* Enable All Groups toggle
* Analytics panel position persistence across patent pages
* Profile version tracking and schema migration support

### Improved

* Longer keywords are prioritized during regex matching
* Statistics filtering and patent section analysis workflow
* Group management experience
* Project documentation organization
* Module separation and maintainability

### Refactored

* Extracted settings management into `settings.js`
* Extracted storage operations into `storage.js`
* Extracted profile management into `profiles.js`
* Extracted import/export workflows into `importExport.js`
* Extracted save/reset workflows into `saveReset.js`
* Extracted group rendering into `groupRenderer.js`
* Extracted drag and drop logic into `dragDrop.js`
* Extracted group lifecycle management into `groupsManager.js`
* Centralized constants and version management
* Removed direct storage access from `popup.js`


## v1.1.0 (2026-05-30)

Stable v1.1 before phrase engine

### Added

* Active / Inactive toggle
* Save workflow
* Reset workflow
* Automatic highlighting on page load
* Match Whole Word Only option
* Immediate highlight refresh when match mode changes
* Regex mode aware caching
* Improved project documentation

### Improved

* Highlighting engine refactored to support multiple matching modes
* Auto highlight behavior across page refreshes and new patent pages
* User workflow and setup documentation
* Reset behavior now restores all default settings

## v1.0.0 (2026-05-29)

Initial stable release

* Dynamic groups
* Drag reorder
* Collapse / expand
* Persistent storage

