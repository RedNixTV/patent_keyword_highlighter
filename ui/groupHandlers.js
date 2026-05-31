
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
    persistGroups
}) {

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