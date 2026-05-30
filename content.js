console.log("CONTENT SCRIPT LOADED");
// Cache compiled regex objects so they can be reused
// across multiple highlight runs.
const regexCache = new Map();

function clearHighlights() {

    const marks = document.querySelectorAll("mark[data-patent-highlight]");

    marks.forEach(mark => {

        const textNode = document.createTextNode(mark.textContent);

        mark.parentNode.replaceChild(textNode, mark);
    });

    document.body.normalize();
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRegex(group, wholeWordOnly) {

    const key =
    		`${wholeWordOnly}|` +
			[...group.keywords]
				.sort()
				.join(",");

    if (!regexCache.has(key)) {

        regexCache.set(
            key,
            buildRegex(
				group.keywords,
				wholeWordOnly
			)
        );
    }

    return regexCache.get(key);
}

function buildRegex(
    keywords,
    wholeWordOnly
) {

    if (!keywords.length) {
        return null;
    }

    const pattern =
        keywords
            .map(escapeRegex)
            .join("|");

    return new RegExp(
        wholeWordOnly
            ? `\\b(${pattern})\\b`
            : `(${pattern})`,
        "gi"
    );
}

function highlightGroup(regex, color) {

    if (!regex) {
        return;
    }

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {

                if (!node.parentElement) {
                    return NodeFilter.FILTER_REJECT;
                }

                const tag = node.parentElement.tagName;

                if (
                    ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(tag)
                ) {
                    return NodeFilter.FILTER_REJECT;
                }

                if (
                    node.parentElement.closest("mark[data-patent-highlight]")
                ) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    const nodes = [];

    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {

        const text = node.nodeValue;
		
		const hasMatch = regex.test(text);
		
		regex.lastIndex = 0;
		
		if (!hasMatch) {
			return;
		}

        const fragment = document.createDocumentFragment();

        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {

            const before = text.slice(lastIndex, match.index);

            if (before) {
                fragment.appendChild(
                    document.createTextNode(before)
                );
            }

            const mark = document.createElement("mark");

            mark.style.backgroundColor = color;

            mark.setAttribute("data-patent-highlight", "true");

            mark.textContent = match[0];

            fragment.appendChild(mark);

            lastIndex = regex.lastIndex;
        }

        const after = text.slice(lastIndex);

        if (after) {
            fragment.appendChild(
                document.createTextNode(after)
            );
        }

        node.parentNode.replaceChild(fragment, node);
    });
}

async function applyHighlights(groups)  {

    clearHighlights();
    const settings =
		await chrome.storage.local.get(
			"wholeWordOnly"
		);
	
	const wholeWordOnly =
		settings.wholeWordOnly === true;

    groups.forEach(group => {

        const regex =
			getRegex(
				group,
				wholeWordOnly
			);

        highlightGroup(
            regex,
            group.color
        );
    });
}

// -----------------------------------
// AUTO HIGHLIGHT ON PAGE LOAD
// -----------------------------------

(async () => {

    const saved =
        await chrome.storage.local.get([
            "groups",
            "autoHighlight"
        ]);

    if (saved.autoHighlight !== true) {
        return;
    }

    applyHighlights(
        (saved.groups || [])
            .filter(group => group.enabled)
    );

})();


chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {

        if (request.action === "clear") {

            clearHighlights();
        }

        if (request.action === "highlight") {

            applyHighlights(
                request.groups
            );
        }

        if (request.action === "refresh") {

            const saved =
                await chrome.storage.local.get(
                    "groups"
                );

            applyHighlights(
                (saved.groups || [])
                    .filter(group => group.enabled)
            );
        }

        sendResponse({
            success: true
        });

        return true;
    }
);