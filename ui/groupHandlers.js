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