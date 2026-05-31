
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