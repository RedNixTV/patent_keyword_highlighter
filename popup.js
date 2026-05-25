document.addEventListener("DOMContentLoaded", async () => {

    const groupsContainer =
        document.getElementById("groupsContainer");

    const DEFAULT_GROUPS = [

        {
            id: crypto.randomUUID(),
            label: "Base Device",
            color: "#ff0000",
            keywords: [],
            collapsed: false,
            enabled: true
        },

        {
            id: crypto.randomUUID(),
            label: "Function / Business Logic",
            color: "#00aa00",
            keywords: [],
            collapsed: false,
            enabled: true
        },

        {
            id: crypto.randomUUID(),
            label: "Technical",
            color: "#d9b3ff",
            keywords: [],
            collapsed: false,
            enabled: true
        }
    ];

    // -----------------------------------
    // LOAD GROUPS
    // -----------------------------------

    const saved =
        await chrome.storage.local.get("groups");

    let groups = (saved.groups || DEFAULT_GROUPS).map(group => ({

		enabled: true,
		collapsed: false,
	
		...group
	}));

    // -----------------------------------
    // RENDER GROUPS
    // -----------------------------------
	let draggedGroupId = null;
	async function saveGroups() {
		await chrome.storage.local.set({
			groups
		});
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
						
							<button
								class="preset-btn"
								${group.color === "#ff0000" ? "active-preset" : ""}"
								data-color="#ff0000"
								style="background:#ff0000;">
							</button>
						
							<button
								class="preset-btn"
								${group.color === "#ff8800" ? "active-preset" : ""}"
								data-color="#ff8800"
								style="background:#ff8800;">
							</button>
						
							<button
								class="preset-btn"
								${group.color === "#dddddd" ? "active-preset" : ""}"
								data-color="#dddddd"
								style="background:#dddddd;">
							</button>
						
							<button
								class="preset-btn"
								${group.color === "#00aa00" ? "active-preset" : ""}"
								data-color="#00aa00"
								style="background:#00aa00;">
							</button>
						
							<button
								class="preset-btn"
								${group.color === "#0088ff" ? "active-preset" : ""}"
								data-color="#0088ff"
								style="background:#0088ff;">
							</button>
						
							<button
								class="preset-btn"
								${group.color === "#d9b3ff" ? "active-preset" : ""}"
								data-color="#d9b3ff"
								style="background:#d9b3ff;">
							</button>
						
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
							saveGroups();
						});
				wrapper.querySelector(".group-enabled")
						.addEventListener("change", (e) => {
					
							group.enabled =
								e.target.checked;
							saveGroups();
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
					saveGroups();
				});
            // -----------------------------
            // LABEL
            // -----------------------------

            wrapper.querySelector(".group-label")
                .addEventListener("input", (e) => {

                    group.label =
                        e.target.value;
                    saveGroups();
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
                    saveGroups();
                });

            // -----------------------------
            // COLOR
            // -----------------------------

            wrapper.querySelector(".group-color")
                .addEventListener("input", (e) => {

                    group.color =
                        e.target.value;
                    saveGroups();
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
			
						saveGroups();
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
                    saveGroups();
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
            saveGroups();
        });

    // -----------------------------------
    // HIGHLIGHT
    // -----------------------------------

    document.getElementById("highlightBtn")
        .addEventListener("click", async () => {

            await chrome.storage.local.set({
                groups
            });

            const [tab] =
                await chrome.tabs.query({
                    active: true,
                    currentWindow: true
                });

            chrome.tabs.sendMessage(
                tab.id,
                {
                    action: "highlight",
                    groups: groups.filter(group => group.enabled)
                }
            );
        });

    // -----------------------------------
    // CLEAR
    // -----------------------------------

    document.getElementById("clearBtn")
        .addEventListener("click", async () => {

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
});