export function attachDragHandlers({
    wrapper,
    group,
    groups,
    renderGroups,
    persistGroups,
    getDraggedGroupId,
    setDraggedGroupId
}) {

    wrapper.addEventListener("dragstart", () => {

        setDraggedGroupId(group.id);

        wrapper.classList.add("dragging");
    });

    wrapper.addEventListener("dragend", () => {

        wrapper.classList.remove("dragging");
    });

    wrapper.addEventListener("dragover", (e) => {

        e.preventDefault();
    });

    wrapper.addEventListener("drop", () => {

        const draggedGroupId =
            getDraggedGroupId();

        if (draggedGroupId === group.id) {
            return;
        }

        const draggedIndex =
            groups.findIndex(
                g => g.id === draggedGroupId
            );

        const targetIndex =
            groups.findIndex(
                g => g.id === group.id
            );

        const [draggedGroup] =
            groups.splice(
                draggedIndex,
                1
            );

        groups.splice(
            targetIndex,
            0,
            draggedGroup
        );

        renderGroups();
        persistGroups();
    });
}