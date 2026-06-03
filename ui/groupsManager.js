import {
    loadGroups,
    saveGroups
} from "../storage.js";

import {
    renderGroups
} from "./groupRenderer.js";

import {
    attachDragHandlers as setupDragHandlers
} from "./dragDrop.js";

import {
    createGroupHandlers
} from "./groupHandlers.js";


export async function createGroupsManager({
    groupsContainer
}) {

    let groups =
        await loadGroups();

    let draggedGroupId =
        null;

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
						renderGroups:
							refreshGroups,
						persistGroups,
						getDraggedGroupId:
							() =>
								draggedGroupId,
						setDraggedGroupId:
							(id) => {
	
								draggedGroupId = id;
							}
					});
				},
	
			...handlers
		});
		
		const enableAll =
			document.getElementById(
				"enableAllGroups"
			);
		
		if (enableAll) {
		
			enableAll.checked =
				groups.every(
					group => group.enabled
				);
		}
	}
	
	function addGroup() {
	
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
	}
		
    refreshGroups();

    return {
        getGroups: () => groups,
        setGroups: (newGroups) => {
            groups = newGroups;
        },
        refreshGroups,
        persistGroups,
        addGroup
    };
}