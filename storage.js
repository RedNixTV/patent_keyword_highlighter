import {
    DEFAULT_GROUPS,
    PROFILE_VERSION,
    STORAGE_VERSIONS
} from "./constants.js";

const STORAGE_VERSION =
    PROFILE_VERSION;
    
export async function loadGroups() {

    const saved =
        await chrome.storage.local.get("groups");

    return (
        saved.groups ||
        DEFAULT_GROUPS
    ).map(group => ({

        enabled: true,
        collapsed: false,
        phrases:
			group.phrases ?? [],
		weight:
			group.weight ?? 3,
	
		critical:
			group.critical ?? false,

        ...group
    }));
}

export async function saveGroups(groups) {

    await chrome.storage.local.set({
        groups,
        storageVersion: STORAGE_VERSION
    });
}

export async function loadSettings() {

    const settings =
        await chrome.storage.local.get([
            "autoHighlight",
            "wholeWordOnly",
            "profileName",
            "analysisScope"
        ]);

    return {
        autoHighlight:
            settings.autoHighlight ?? true,

        wholeWordOnly:
            settings.wholeWordOnly ?? false,

        profileName:
            settings.profileName ?? "",
            
        analysisScope:
			settings.analysisScope ?? "all"
    };
}

export async function saveSettings(settings) {

    await chrome.storage.local.set(settings);
}

export async function runMigrations() {

    const saved =
        await chrome.storage.local.get([
            "storageVersion",
            "groups"
        ]);

    let version =
        saved.storageVersion ||
        STORAGE_VERSIONS.V1_0_0;

    let groups =
        saved.groups || [];

    if (
        version ===
        STORAGE_VERSIONS.V1_0_0
    ) {

        groups = groups.map(group => ({

            enabled:
                group.enabled ?? true,

            collapsed:
                group.collapsed ?? false,

            id:
                group.id ||
                crypto.randomUUID(),

            ...group
        }));

        version =
            STORAGE_VERSIONS.V1_1_0;
    }
    
    if (
		version ===
		STORAGE_VERSIONS.V1_1_0
	) {
	
		version =
			STORAGE_VERSIONS.V1_2_0;
	}
	
	if (
		version ===
		STORAGE_VERSIONS.V1_2_0
	) {
	
		groups = groups.map(group => ({
	
			phrases:
				group.phrases ?? [],
				
			weight:
				group.weight ?? 3,
	
			critical:
				group.critical ?? false,
	
			...group
		}));
	
		version =
			STORAGE_VERSIONS.V1_3_0;
	}

    await chrome.storage.local.set({

        groups,
        storageVersion: version
    });
}

export async function loadKeywordMode() {

    const saved =
        await chrome.storage.local.get(
            "activeKeywordMode"
        );

    return (
        saved.activeKeywordMode ||
        "single"
    );
}

export async function saveKeywordMode(
    mode
) {

    await chrome.storage.local.set({
        activeKeywordMode: mode
    });
}