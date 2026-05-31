export async function loadGroups() {

    const saved =
        await chrome.storage.local.get("groups");

    return (
        saved.groups ||
        DEFAULT_GROUPS
    ).map(group => ({

        enabled: true,
        collapsed: false,

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
            "profileName"
        ]);

    return {
        autoHighlight:
            settings.autoHighlight ?? true,

        wholeWordOnly:
            settings.wholeWordOnly ?? false,

        profileName:
            settings.profileName ?? ""
    };
}

export async function saveSettings(settings) {

    await chrome.storage.local.set(settings);
}