import {
    loadGroups,
    saveGroups,
    loadKeywordMode,
    saveKeywordMode
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
        
    let activeKeywordMode =
		await loadKeywordMode();
		
	const singleModeBtn =
		document.getElementById(
			"singleModeBtn"
		);
	
	const phraseModeBtn =
		document.getElementById(
			"phraseModeBtn"
		);
		
	function updateModeButtons() {
	
		singleModeBtn.classList.toggle(
			"mode-active",
			activeKeywordMode === "single"
		);
	
		phraseModeBtn.classList.toggle(
			"mode-active",
			activeKeywordMode === "phrase"
		);
	}
	
	updateModeButtons();
	
	singleModeBtn.addEventListener(
		"click",
		async () => {
	
			if (
				activeKeywordMode === "single"
			) {
				return;
			}
	
			activeKeywordMode =
				"single";
	
			await saveKeywordMode(
				activeKeywordMode
			);
	
			updateModeButtons();
	
			refreshGroups();
		}
	);
	
	phraseModeBtn.addEventListener(
		"click",
		async () => {
	
			if (
				activeKeywordMode === "phrase"
			) {
				return;
			}
	
			activeKeywordMode =
				"phrase";
	
			await saveKeywordMode(
				activeKeywordMode
			);
	
			updateModeButtons();
	
			refreshGroups();
		}
	);

    async function persistGroups() {
		await saveGroups(groups);
	}
    
    function refreshGroups() {
	
		const handlers =
			createGroupHandlers({
				groups,
				activeKeywordMode,
				setGroups: (newGroups) => {
					groups = newGroups;
				},
				refreshGroups,
				persistGroups
			});
	
		renderGroups({
	
			groups,
			
			activeKeywordMode,
	
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
			
			phrases: [],
	
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