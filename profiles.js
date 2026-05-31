import {
    PROFILE_VERSION
} from "./constants.js";

export function createProfileData({
    profileName,
    groups,
    autoHighlight,
    wholeWordOnly
}) {
    return {
        profileName,
        version: PROFILE_VERSION,
        exportedAt: new Date().toISOString(),
        groups,
        autoHighlight,
        wholeWordOnly
    };
}

export function validateProfile(
    profile
) {
    if (!profile) {
        throw new Error(
            "Profile missing"
        );
    }

    if (!profile.profileName) {
        throw new Error(
            "Profile name missing"
        );
    }

    if (
        !Array.isArray(profile.groups)
    ) {
        throw new Error(
            "Invalid groups"
        );
    }
}

export function migrateProfile(
    profile
) {
    return profile;
}

export async function loadAllProfiles() {

    const { profiles = {} } =
        await chrome.storage.local.get(
            "profiles"
        );

    return profiles;
}

export async function saveAllProfiles(
    profiles
) {
    await chrome.storage.local.set({
        profiles
    });
}

export async function loadProfile(
    profileName
) {
    const profiles =
        await loadAllProfiles();

    return profiles[profileName];
}

export async function saveProfile(
    profileName,
    profileData
) {

    const profiles =
        await loadAllProfiles();

    profiles[profileName] =
        profileData;

    await saveAllProfiles(
        profiles
    );
}

export async function exportProfile(
    profileName
) {
    const profile =
        await loadProfile(
            profileName
        );

    return {
        profileName,
        version:
            PROFILE_VERSION,
        exportedAt:
            new Date().toISOString(),
        ...profile
    };
}

export async function importProfile(
    profileData
) {
    validateProfile(profileData);

    const migrated =
        migrateProfile(profileData);

    migrated.groups =
        normalizeGroups(
            migrated.groups
        );

    await saveProfile(
        migrated.profileName,
        migrated
    );

    return migrated;
}

function normalizeGroups(
    groups
) {
    return groups.map(group => ({
        id:
            group.id ||
            crypto.randomUUID(),

        enabled:
            group.enabled ?? true,

        collapsed:
            group.collapsed ?? false,

        phraseMode:
            group.phraseMode ?? false,

        ...group
    }));
}

export async function parseProfileFile(
    file
) {
    const text =
        await file.text();

    return JSON.parse(text);
}