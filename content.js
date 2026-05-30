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

function getRegex(group) {

    const key =
        [...group.keywords]
            .sort()
            .join(",");

    if (!regexCache.has(key)) {

        regexCache.set(
            key,
            buildRegex(group.keywords)
        );
    }

    return regexCache.get(key);
}

function buildRegex(keywords) {

    if (!keywords.length) {
        return null;
    }

    return new RegExp(
        "\\b(" +
        keywords.map(escapeRegex).join("|") +
        ")\\b",
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "clear") {

        clearHighlights();

        sendResponse({
            success: true
        });
    }

    if (request.action === "highlight") {

		clearHighlights();
	
		request.groups.forEach(group => {
		
			const regex =
				getRegex(group);
		
			highlightGroup(
				regex,
				group.color
			);
		});
	
		sendResponse({
			success: true
		});
	}

    return true;
});