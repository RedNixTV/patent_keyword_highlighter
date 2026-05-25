document.addEventListener("DOMContentLoaded", async () => {

    const groupsContainer =
        document.getElementById("groupsContainer");

    const DEFAULT_GROUPS = [

        {
            id: crypto.randomUUID(),
            label: "Base Device",
            color: "#ff0000",
            keywords: []
        },

        {
            id: crypto.randomUUID(),
            label: "Function / Business Logic",
            color: "#00aa00",
            keywords: []
        },

        {
            id: crypto.randomUUID(),
            label: "Technical",
            color: "#d9b3ff",
            keywords: []
        }
    ];

    // -----------------------------------
    // LOAD GROUPS
    // -----------------------------------

    const saved =
        await chrome.storage.local.get("groups");

    let groups =
        saved.groups || DEFAULT_GROUPS;

    // -----------------------------------
    // RENDER GROUPS
    // -----------------------------------

    function renderGroups() {

        groupsContainer.innerHTML = "";

        groups.forEach(group => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "group-block";

            wrapper.innerHTML = `

                <input
                    type="text"
                    class="group-label"
                    value="${group.label}"
                >

                <textarea class="group-keywords">${group.keywords.join(", ")}</textarea>

                <div class="color-row">

                    <label>Color:</label>

                    <input
                        type="color"
                        class="group-color"
                        value="${group.color}"
                    >

                </div>

                <button class="delete-group-btn">
                    Delete Group
                </button>
            `;

            // -----------------------------
            // LABEL
            // -----------------------------

            wrapper.querySelector(".group-label")
                .addEventListener("input", (e) => {

                    group.label =
                        e.target.value;
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
                });

            // -----------------------------
            // COLOR
            // -----------------------------

            wrapper.querySelector(".group-color")
                .addEventListener("input", (e) => {

                    group.color =
                        e.target.value;
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

                keywords: []
            });

            renderGroups();
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
                    groups
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