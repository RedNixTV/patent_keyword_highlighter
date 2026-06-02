import {
    saveSettings
} from "./storage.js";

export function initializeSettings(settings) {

    initializeAutoHighlight(settings);

    initializeWholeWordOnly(settings);

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

    applySettingsToUI({

        autoHighlight: true,

        wholeWordOnly: false,

        profileName: ""
    });
}