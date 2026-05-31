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

export function createGroupMarkup(group) {

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
}

export function renderGroups({
    groups,
    groupsContainer,
    persistGroups,
    attachDragHandlers,
    onLabelChange,
    onKeywordsChange,
    onColorChange,
    onPresetColorChange,
    onDeleteGroup,
    onToggleCollapse,
    onToggleEnabled
}) {

    groupsContainer.innerHTML = "";

    groups.forEach(group => {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "group-block";

        wrapper.draggable = true;

        wrapper.innerHTML =
            createGroupMarkup(group);

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