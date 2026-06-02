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
    importProfile,
    createProfileData,
    parseProfileFile,
    createProfileBlob,
    createProfileFileName
} from "./profiles.js";

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
    saveProfileName
} from "./settings.js";
    
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

    // -----------------------------------
    // HIGHLIGHT
    // -----------------------------------

    document.getElementById("saveBtn")
    .addEventListener("click", async () => {

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
    
    document.getElementById("resetBtn")
    .addEventListener("click", async () => {

        groups = DEFAULT_GROUPS.map(group => ({
            ...group,
            id: crypto.randomUUID()
        }));
        
        await saveGroups(groups);
        
        await saveSettings({
		
			autoHighlight: true,
		
			wholeWordOnly: false,
		
			profileName: ""
		});

        document.getElementById(
            "autoHighlight"
        ).checked = true;
        
        document.getElementById(
			"wholeWordOnly"
		).checked = false;
		
		document.getElementById(
			"profileName"
		).value = "";

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
    
    // -----------------------------------
	// EXPORT PROFILE
	// -----------------------------------
	
	document.getElementById("exportBtn")
		.addEventListener("click", async () => {
	
			const settings = await loadSettings();
	
			const exportData =
				createProfileData({
					profileName:
						saveProfileName()||
						"Patent Search Profile",
			
					groups,
			
					autoHighlight:
						settings.autoHighlight,
			
					wholeWordOnly:
						settings.wholeWordOnly
				});
				
			const blob =
				createProfileBlob(
					exportData
				);
	
			const url =
				URL.createObjectURL(blob);
	
			const a =
				document.createElement("a");
	
			a.href = url;
	
			a.download =
				createProfileFileName(
					exportData.profileName
				);
	
			a.click();
	
			URL.revokeObjectURL(url);
		});
	
	document.getElementById("importBtn")
    .addEventListener("click", () => {

        document
            .getElementById("importFile")
            .click();
    });
    
    // -----------------------------------
	// IMPORT PROFILE
	// -----------------------------------
	
	document.getElementById("importFile")
		.addEventListener("change", async (e) => {
	
			const file =
				e.target.files[0];
	
			if (!file) {
				return;
			}

	
			try {
	
				const data =
						await parseProfileFile(
							file
						);
					
					const profile =
						await importProfile(
							data
						);
					
					groups =
						profile.groups;
					
					await saveGroups(groups);
					
					await saveSettings({
					
						profileName:
							profile.profileName || "",
					
						autoHighlight:
							profile.autoHighlight ?? true,
					
						wholeWordOnly:
							profile.wholeWordOnly ?? false
					});
					
					document.getElementById(
						"autoHighlight"
					).checked =
						profile.autoHighlight ?? true;
					
					document.getElementById(
						"wholeWordOnly"
					).checked =
						profile.wholeWordOnly ?? false;
					
					document.getElementById(
						"profileName"
					).value =
						profile.profileName || "";
					
					refreshGroups();
					
					alert(
						"Profile imported successfully."
					);
			} catch {
	
				alert(
					"Unable to import profile."
				);
			}
	
			e.target.value = "";
		});
});