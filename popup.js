import {
  DEFAULT_GROUPS,
  PRESET_COLORS,
  PROFILE_VERSION,
  STORAGE_VERSIONS
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
    setupCollapseHandler,
    setupDeleteHandler
} from "./ui/groupHandlers.js";

const STORAGE_VERSION = PROFILE_VERSION;
    
document.addEventListener("DOMContentLoaded", async () => {

    const settings = await loadSettings();
	
	document.getElementById("autoHighlight").checked =
		settings.autoHighlight;
		
	document
		.getElementById("autoHighlight")
		.addEventListener("change", async (e) => {
	
			const enabled =
				e.target.checked;
	
			await chrome.storage.local.set({
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
		
		document.getElementById(
			"wholeWordOnly"
		).checked =
			settings.wholeWordOnly;
			
	document
		.getElementById("wholeWordOnly")
		.addEventListener("change", async (e) => {
	
			await chrome.storage.local.set({
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
	
	document.getElementById(
		"profileName"
	).value =
		settings.profileName || "";
		
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
		
				onToggleCollapse:
					(wrapper, group) => {
				
						setupCollapseHandler({
							wrapper,
							group,
							refreshGroups,
							persistGroups
						});
					},
						
				onToggleEnabled:
					(wrapper, group) => {
		
						wrapper
							.querySelector(".group-enabled")
							.addEventListener("change", e => {
		
								group.enabled =
									e.target.checked;
		
								persistGroups();
							});
					},
		
				onLabelChange:
					(wrapper, group) => {
		
						wrapper
							.querySelector(".group-label")
							.addEventListener("input", e => {
		
								group.label =
									e.target.value;
		
								persistGroups();
							});
					},
		
				onKeywordsChange:
					(wrapper, group) => {
		
						wrapper
							.querySelector(".group-keywords")
							.addEventListener("input", e => {
		
								group.keywords =
									e.target.value
										.split(",")
										.map(k => k.trim())
										.filter(Boolean);
		
								persistGroups();
							});
					},
		
				onColorChange:
					(wrapper, group) => {
		
						wrapper
							.querySelector(".group-color")
							.addEventListener("input", e => {
		
								group.color =
									e.target.value;
		
								persistGroups();
							});
					},
		
				onPresetColorChange:
					(wrapper, group) => {
		
						wrapper
							.querySelectorAll(".preset-btn")
							.forEach(button => {
		
								button.addEventListener("click", () => {
		
									const color =
										button.dataset.color;
		
									if (group.color === color) {
										return;
									}
		
									group.color =
										color;
		
									wrapper
										.querySelector(".group-color")
										.value =
										color;
		
									persistGroups();
								});
							});
					},
		
				onDeleteGroup:
					(wrapper, group) => {
				
						setupDeleteHandler({
							wrapper,
							group,
							groups,
							setGroups: (newGroups) => {
				
								groups = newGroups;
							},
							refreshGroups,
							persistGroups
						});
					}
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

        await chrome.storage.local.set({
		
			groups,
			
			storageVersion:
				STORAGE_VERSION,
		
			profileName:
				document.getElementById(
					"profileName"
				).value.trim()
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
						document.getElementById(
							"profileName"
						).value.trim() ||
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
					
					await chrome.storage.local.set({
					
						groups,
					
						storageVersion:
							STORAGE_VERSION,
					
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