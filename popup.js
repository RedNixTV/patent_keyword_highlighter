import {
    DEFAULT_GROUPS
} from "./constants.js";

import {
    loadGroups,
    saveGroups,
    loadSettings,
    saveSettings,
    runMigrations
} from "./storage.js";

import {
    setupExportHandler,
    setupImportHandler
} from "./importExport.js";

import {
    initializeSettings,
    saveProfileName,
    applySettingsToUI,
    resetSettingsUI
} from "./settings.js";

import {
    setupSaveHandler,
    setupResetHandler
} from "./saveReset.js";

import {
    createGroupsManager
} from "./ui/groupsManager.js";
    
document.addEventListener("DOMContentLoaded", async () => {

    const settings = await loadSettings();
    
    initializeSettings(settings);
		
    const groupsContainer =
        document.getElementById("groupsContainer");
	
    // -----------------------------------
    // LOAD GROUPS
    // -----------------------------------

    await runMigrations();
    
    const groupsManager =
		await createGroupsManager({
			groupsContainer
		});
    
    setupExportHandler({
		getGroups:
		groupsManager.getGroups
	});
	
	setupImportHandler({
		setGroups:
			groupsManager.setGroups,
		
		refreshGroups:
			groupsManager.refreshGroups,
		
		persistGroups:
			groupsManager.persistGroups
	});
	
	document.getElementById("addGroupBtn")
		.addEventListener("click", () => {
	
			groupsManager.addGroup();
		});

	setupSaveHandler({
		getGroups:
			groupsManager.getGroups
	});
	
	setupResetHandler({
		setGroups:
			groupsManager.setGroups,
		
		refreshGroups:
			groupsManager.refreshGroups
	});
    
});