import {
    saveSettings
} from "./storage.js";

export function initializeSettings(settings, groupsManager) {

    initializeAutoHighlight(settings);

    initializeWholeWordOnly(settings);
    
    initializeEnableAllGroups(
        groupsManager
    );
    
    initializeToggleLabel();

    loadProfileName(settings);
}

export function initializeAutoHighlight(settings) {

	document.getElementById("autoHighlight").checked =
		settings.autoHighlight;
		
	document
		.getElementById("autoHighlight")
		.addEventListener("change", async (e) => {
	
			const enabled =
				e.target.checked;
	
			await saveSettings({
				autoHighlight: enabled
			});
	
			const [tab] =
				await chrome.tabs.query({
					active: true,
					currentWindow: true
				});
	
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

export function initializeWholeWordOnly(settings) {
    
    document.getElementById(
			"wholeWordOnly"
		).checked =
			settings.wholeWordOnly;
			
	document
		.getElementById("wholeWordOnly")
		.addEventListener("change", async (e) => {
	
			await saveSettings({
				wholeWordOnly: e.target.checked
			});
	
			const [tab] =
				await chrome.tabs.query({
					active: true,
					currentWindow: true
				});
	
			chrome.tabs.sendMessage(
				tab.id,
				{
					action: "refresh"
				}
			);
		});
}

export function initializeToggleLabel() {

    const toggle =
		document.getElementById("autoHighlight");
	
	const label =
		document.getElementById("toggleLabel");
	
	function updateLabel() {
		label.textContent =
			toggle.checked
				? "Active"
				: "Inactive";
	}
	
	updateLabel();
	
	toggle.addEventListener("change", updateLabel);
	
}

export function loadProfileName(settings) {
    document.getElementById(
		"profileName"
	).value =
		settings.profileName || "";
}

export function saveProfileName() {
    return document
        .getElementById("profileName")
        .value
        .trim();
}

export function applySettingsToUI(settings) {

    document.getElementById(
        "autoHighlight"
    ).checked =
        settings.autoHighlight;

    document.getElementById(
        "wholeWordOnly"
    ).checked =
        settings.wholeWordOnly;

    document.getElementById(
        "profileName"
    ).value =
        settings.profileName;
}

export function resetSettingsUI() {

	const enableAll =
		document.getElementById(
			"enableAllGroups"
		);
	
	if (enableAll) {
		enableAll.checked = true;
	}

    applySettingsToUI({

        autoHighlight: true,

        wholeWordOnly: false,

        profileName: "",
        
        analysisScope: "all"
    });
}

export function initializeEnableAllGroups(
    groupsManager
) {

    const checkbox =
        document.getElementById(
            "enableAllGroups"
        );

    checkbox.checked =
        groupsManager
            .getGroups()
            .every(
                group => group.enabled
            );

    checkbox.addEventListener(
        "change",
        async e => {

            const enabled =
                e.target.checked;

            const groups =
                groupsManager
                    .getGroups();

            groups.forEach(group => {
                group.enabled = enabled;
            });

            await groupsManager.persistGroups();

            groupsManager.refreshGroups();
        }
    );
}