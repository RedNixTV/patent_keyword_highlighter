import {
    saveGroups,
    saveSettings
} from "./storage.js";

import {
    DEFAULT_GROUPS
} from "./constants.js";

import {
    saveProfileName,
    resetSettingsUI
} from "./settings.js";

export function setupSaveHandler({
    getGroups
}) {

    document.getElementById("saveBtn")
        .addEventListener("click", async () => {

            const groups =
                getGroups();

            await saveGroups(groups);

            await saveSettings({
                profileName:
                    saveProfileName()
            });

            const [tab] =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });

            const enabled =
                document.getElementById(
                    "autoHighlight"
                ).checked;

            chrome.tabs.sendMessage(
                tab.id,
                {
                    action:
                        enabled
                            ? "refresh"
                            : "clear"
                }
            );
        });
}

export function setupResetHandler({
    setGroups,
    refreshGroups
}) {

    document.getElementById("resetBtn")
        .addEventListener("click", async () => {

            const groups =
                DEFAULT_GROUPS.map(group => ({
                    ...group,
                    id: crypto.randomUUID()
                }));

            setGroups(groups);

            await saveGroups(groups);

            await saveSettings({
                autoHighlight: true,
                wholeWordOnly: false,
                profileName: ""
            });

            resetSettingsUI();

            refreshGroups();

            const [tab] =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });

            chrome.tabs.sendMessage(
                tab.id,
                {
                    action: "clear"
                }
            );
        });
}