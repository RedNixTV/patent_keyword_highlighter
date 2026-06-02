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
    renderGroups
} from "./ui/groupRenderer.js";

import {
    attachDragHandlers as setupDragHandlers
} from "./ui/dragDrop.js";

import {
    createGroupHandlers
} from "./ui/groupHandlers.js";

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
    
document.addEventListener("DOMContentLoaded", async () => {

    const settings = await loadSettings();
    
    initializeSettings(settings);
		
    const groupsContainer =
        document.getElementById("groupsContainer");
	
    // -----------------------------------
    // LOAD GROUPS
    // -----------------------------------

    await runMigrations();

    let groups = await loadGroups();

    // -----------------------------------
    // RENDER GROUPS
    // -----------------------------------
	let draggedGroupId = null;
	async function persistGroups() {
		await saveGroups(groups);
	}
	
	function refreshGroups() {
			
			const handlers =
				createGroupHandlers({
					groups,
					setGroups: (newGroups) => {
						groups = newGroups;
					},
					refreshGroups,
					persistGroups
				});
			
			renderGroups({
			
				groups,
			
				groupsContainer,
			
				persistGroups,
			
				attachDragHandlers:
					(wrapper, group) => {
			
						setupDragHandlers({
							wrapper,
							group,
							groups,
							renderGroups: refreshGroups,
							persistGroups,
							getDraggedGroupId: () =>
								draggedGroupId,
							setDraggedGroupId: (id) => {
			
								draggedGroupId = id;
							}
						});
					},
			
				...handlers
			});
		}

    refreshGroups();
    setupExportHandler({
		getGroups: () => groups
	});
	
	setupImportHandler({
		setGroups: (newGroups) => {
			groups = newGroups;
		},
		refreshGroups,
		persistGroups
	});

    // -----------------------------------
    // ADD GROUP
    // -----------------------------------

    document.getElementById("addGroupBtn")
        .addEventListener("click", () => {

            groups.push({

                id: crypto.randomUUID(),
                label: "New Group",
                color: "#ffff00",
                keywords: [],
                collapsed: false,
                enabled: true
            });

            refreshGroups();
            persistGroups();
        });

		setupSaveHandler({
			getGroups: () => groups
		});
		
		setupResetHandler({
			setGroups: (newGroups) => {
				groups = newGroups;
			},
			refreshGroups
		});
    
});