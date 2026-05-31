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
	
	function createPresetButtons(selectedColor) {
	
		return PRESET_COLORS
			.map(color => `
				<button
					class="preset-btn
						${selectedColor === color ? "active-preset" : ""}"
					data-color="${color}"
					style="background:${color};">
				</button>
			`)
			.join("");
	}

    function renderGroups() {

        groupsContainer.innerHTML = "";

        groups.forEach(group => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "group-block";
            wrapper.draggable = true;

            wrapper.innerHTML = `

					<div class="group-header">
				
						<button class="collapse-btn">
							${group.collapsed ? "▶" : "▼"}
						</button>
						
						<input
							type="checkbox"
							class="group-enabled"
							${group.enabled ? "checked" : ""}
						>
				
						<input
							type="text"
							class="group-label"
							value="${group.label}"
						>
				
					</div>
				
					<div class="group-content"
						 style="display: ${group.collapsed ? "none" : "block"};">
				
						<textarea class="group-keywords">${group.keywords.join(", ")}</textarea>
				
						<div class="color-row">
						
							<label>Color:</label>
						
							${createPresetButtons(group.color)}
						
							<input
								type="color"
								class="group-color"
								value="${group.color}"
							>
						
						</div>
				
						<button class="delete-group-btn">
							Delete Group
						</button>
				
					</div>
				`;
				
				wrapper.querySelector(".collapse-btn")
						.addEventListener("click", () => {
					
							group.collapsed =
								!group.collapsed;
					
							renderGroups();
							persistGroups();
						});
				wrapper.querySelector(".group-enabled")
						.addEventListener("change", (e) => {
					
							group.enabled =
								e.target.checked;
							persistGroups();
						});
				wrapper.addEventListener("dragstart", () => {
					draggedGroupId =
						group.id;
				
					wrapper.classList.add("dragging");
				});
				wrapper.addEventListener("dragend", () => {
					wrapper.classList.remove("dragging");
				});
				wrapper.addEventListener("dragover", (e) => {
					e.preventDefault();
				});
				wrapper.addEventListener("drop", () => {
				
					if (draggedGroupId === group.id) {
						return;
					}
				
					const draggedIndex =
						groups.findIndex(g => g.id === draggedGroupId);
				
					const targetIndex =
						groups.findIndex(g => g.id === group.id);
				
					const [draggedGroup] =
						groups.splice(draggedIndex, 1);
				
					groups.splice(targetIndex, 0, draggedGroup);
				
					renderGroups();
					persistGroups();
				});
            // -----------------------------
            // LABEL
            // -----------------------------

            wrapper.querySelector(".group-label")
                .addEventListener("input", (e) => {

                    group.label =
                        e.target.value;
                    persistGroups();
                });

            // -----------------------------
            // KEYWORDS
            // -----------------------------

            wrapper.querySelector(".group-keywords")
                .addEventListener("input", (e) => {

                    group.keywords =
                        e.target.value
                            .split(",")
                            .map(k => k.trim())
                            .filter(Boolean);
                    persistGroups();
                });

            // -----------------------------
            // COLOR
            // -----------------------------

            wrapper.querySelector(".group-color")
                .addEventListener("input", (e) => {

                    group.color =
                        e.target.value;
                    persistGroups();
                });
                
            wrapper.querySelectorAll(".preset-btn")
				.forEach(button => {
			
					button.addEventListener("click", () => {
			
						const color =
							button.dataset.color;
							
						if (group.color === color) {
							return;
						}
			
						group.color =
							color;
			
						wrapper.querySelector(".group-color").value =
							color;
			
						persistGroups();
					});
				});

            // -----------------------------
            // DELETE GROUP
            // -----------------------------

            wrapper.querySelector(".delete-group-btn")
                .addEventListener("click", () => {
                	if (groups.length === 1) {

						alert("At least one group is required.");
			
						return;
					}
                    groups =
                        groups.filter(g => g.id !== group.id);

                    renderGroups();
                    persistGroups();
                });

            groupsContainer.appendChild(wrapper);
        });
    }

    renderGroups();

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

            renderGroups();
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

        renderGroups();

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
					
					renderGroups();
					
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