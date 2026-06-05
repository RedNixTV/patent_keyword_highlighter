import { PRESET_COLORS } from "../constants.js";

export function createPresetButtons(selectedColor) {

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

export function createGroupMarkup(group, activeKeywordMode) {

	const entries =
		activeKeywordMode === "phrase"
			? group.phrases
			: group.keywords;

    return `
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
             
             <div class="group-structure-row">
			
				<label>
					Weight
				</label>
			
				<select class="group-weight">
			
					<option value="1"
						${group.weight === 1 ? "selected" : ""}>
						1
					</option>
			
					<option value="2"
						${group.weight === 2 ? "selected" : ""}>
						2
					</option>
			
					<option value="3"
						${group.weight === 3 ? "selected" : ""}>
						3
					</option>
			
					<option value="4"
						${group.weight === 4 ? "selected" : ""}>
						4
					</option>
			
					<option value="5"
						${group.weight === 5 ? "selected" : ""}>
						5
					</option>
			
				</select>
			
				<label>
			
					<input
						type="checkbox"
						class="group-critical"
						${group.critical ? "checked" : ""}
					>
			
					Critical
			
				</label>
			
			</div>

            <textarea class="group-keywords">${entries.join(", ")}</textarea>

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
}

export function renderGroups({
    groups,
    activeKeywordMode,
    groupsContainer,
    persistGroups,
    attachDragHandlers,
    onLabelChange,
    onKeywordsChange,
    onColorChange,
    onPresetColorChange,
    onDeleteGroup,
    onToggleCollapse,
    onToggleEnabled,
    onWeightChange,
    onCriticalChange
}) {

    groupsContainer.innerHTML = "";

    groups.forEach(group => {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "group-block";

        wrapper.draggable = true;

        wrapper.innerHTML =
            createGroupMarkup(group, activeKeywordMode);

        onToggleCollapse(
            wrapper,
            group
        );

        onToggleEnabled(
            wrapper,
            group
        );

        attachDragHandlers(
            wrapper,
            group
        );

        onLabelChange(
            wrapper,
            group
        );
        
        onWeightChange(
			wrapper,
			group
		);
		
		onCriticalChange(
			wrapper,
			group
		);

        onKeywordsChange(
            wrapper,
            group
        );

        onColorChange(
            wrapper,
            group
        );

        onPresetColorChange(
            wrapper,
            group
        );

        onDeleteGroup(
            wrapper,
            group
        );

        groupsContainer.appendChild(
            wrapper
        );
    });
}