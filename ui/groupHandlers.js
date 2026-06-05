
export function setupCollapseHandler({
    wrapper,
    group,
    refreshGroups,
    persistGroups
}) {

    wrapper
        .querySelector(".collapse-btn")
        .addEventListener("click", () => {

            group.collapsed =
                !group.collapsed;

            refreshGroups();
            persistGroups();
        });
}

export function setupDeleteHandler({
    wrapper,
    group,
    groups,
    setGroups,
    refreshGroups,
    persistGroups
}) {

    wrapper
        .querySelector(".delete-group-btn")
        .addEventListener("click", () => {

            if (groups.length === 1) {

                alert(
                    "At least one group is required."
                );

                return;
            }

            setGroups(
                groups.filter(
                    g => g.id !== group.id
                )
            );

            refreshGroups();
            persistGroups();
        });
}

export function setupEnabledHandler({
    wrapper,
    group,
    persistGroups
}) {

    wrapper
        .querySelector(".group-enabled")
        .addEventListener("change", e => {

            group.enabled =
                e.target.checked;

            persistGroups();
        });
}

export function setupLabelHandler({
    wrapper,
    group,
    persistGroups
}) {

    wrapper
        .querySelector(".group-label")
        .addEventListener("input", e => {

            group.label =
                e.target.value;

            persistGroups();
        });
}

export function setupKeywordsHandler({
    wrapper,
    group,
    persistGroups,
    activeKeywordMode
}) {

    wrapper
        .querySelector(".group-keywords")
        .addEventListener("input", e => {

            const parsedValues =
				e.target.value
					.split(",")
					.map(k => k.trim())
					.filter(Boolean);
			
			if (
				activeKeywordMode === "phrase"
			) {
			
				group.phrases =
					parsedValues;
			
			}
			else {
			
				group.keywords =
					parsedValues;
			}

            persistGroups();
        });
}

export function setupColorHandler({
    wrapper,
    group,
    persistGroups
}) {

    wrapper
        .querySelector(".group-color")
        .addEventListener("input", e => {

            group.color =
                e.target.value;

            persistGroups();
        });
}

export function setupPresetColorHandler({
    wrapper,
    group,
    persistGroups
}) {

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
}

export function setupWeightHandler({
    wrapper,
    group,
    persistGroups
}) {

    wrapper
        .querySelector(".group-weight")
        .addEventListener("change", e => {

            group.weight =
                Number(
                    e.target.value
                );

            persistGroups();
        });
}

export function setupCriticalHandler({
    wrapper,
    group,
    persistGroups
}) {

    wrapper
        .querySelector(".group-critical")
        .addEventListener("change", e => {

            group.critical =
                e.target.checked;

            persistGroups();
        });
}

export function createGroupHandlers({
    groups,
    setGroups,
    refreshGroups,
    persistGroups,
    activeKeywordMode
}) {

    return {

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

                setupEnabledHandler({
                    wrapper,
                    group,
                    persistGroups
                });
            },

        onLabelChange:
            (wrapper, group) => {

                setupLabelHandler({
                    wrapper,
                    group,
                    persistGroups
                });
            },
            
        onWeightChange:
			(wrapper, group) => {
		
				setupWeightHandler({
					wrapper,
					group,
					persistGroups
				});
			},
		
		onCriticalChange:
			(wrapper, group) => {
		
				setupCriticalHandler({
					wrapper,
					group,
					persistGroups
				});
			},

        onKeywordsChange:
            (wrapper, group) => {

                setupKeywordsHandler({
                    wrapper,
                    group,
                    persistGroups,
                    activeKeywordMode
                });
            },

        onColorChange:
            (wrapper, group) => {

                setupColorHandler({
                    wrapper,
                    group,
                    persistGroups
                });
            },

        onPresetColorChange:
            (wrapper, group) => {

                setupPresetColorHandler({
                    wrapper,
                    group,
                    persistGroups
                });
            },

        onDeleteGroup:
            (wrapper, group) => {

                setupDeleteHandler({
                    wrapper,
                    group,
                    groups,
                    setGroups,
                    refreshGroups,
                    persistGroups
                });
            }
    };
}