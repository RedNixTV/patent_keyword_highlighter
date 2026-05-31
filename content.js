console.log("CONTENT SCRIPT LOADED");
// Cache compiled regex objects so they can be reused
// across multiple highlight runs.
const regexCache = new Map();

function clearHighlights() {
	
	removeStatsPanel();
	
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

function calculateRelevanceScore(stats) {

    const totalGroups =
        Object.keys(stats.groups).length;

    const matchedGroups =
        Object.values(stats.groups)
            .filter(count => count > 0)
            .length;

    const coverageScore =
        (matchedGroups / totalGroups) * 100;

    const volumeScore =
        Math.min(
            stats.totalMatches,
            100
        );

    return Math.round(
        coverageScore * 0.7 +
        volumeScore * 0.3
    );
}

function removeStatsPanel() {

    document
        .getElementById(
            "patent-relevance-panel"
        )
        ?.remove();
}

function renderStatsPanel(
    score,
    stats
) {

    removeStatsPanel();

    const panel =
        document.createElement("div");

    panel.id =
        "patent-relevance-panel";
    
    panel.style.cursor = "move";

    panel.style.position =
        "fixed";
    
    let isDragging = false;
	let offsetX = 0;
	let offsetY = 0;
	
	panel.addEventListener(
		"mousedown",
		(e) => {
	
			isDragging = true;
	
			offsetX =
				e.clientX -
				panel.offsetLeft;
	
			offsetY =
				e.clientY -
				panel.offsetTop;
		}
	);
	
	document.addEventListener(
		"mousemove",
		(e) => {
	
			if (!isDragging) {
				return;
			}
	
			panel.style.left =
				`${e.clientX - offsetX}px`;
	
			panel.style.top =
				`${e.clientY - offsetY}px`;
	
			panel.style.right =
				"auto";
		}
	);
	
	document.addEventListener(
		"mouseup",
		() => {
			isDragging = false;
		}
	);

    panel.style.top =
        "10px";

    panel.style.right =
        "10px";

    panel.style.zIndex =
        "999999";

    panel.style.background =
        "white";

    panel.style.border =
        "1px solid black";

    panel.style.padding =
        "10px";

    panel.style.fontSize =
        "12px";

    panel.style.maxWidth =
        "300px";

    panel.style.boxShadow =
        "0 2px 8px rgba(0,0,0,.2)";

    panel.innerHTML = `
        <h3>Patent Relevance</h3>

        <div>
            Score: ${score}/100
        </div>

        <hr>

        ${Object.entries(stats.groups)
            .map(([label, count]) =>
                `<div>${label}: ${count}</div>`
            )
            .join("")}

        <hr>

        <div>
            Total Matches:
            ${stats.totalMatches}
        </div>
    `;

    document.body.appendChild(panel);
}

function highlightGroup(regex, color, groupLabel, stats) {

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
        
        	stats.groups[groupLabel] = (stats.groups[groupLabel] || 0) + 1;
			stats.totalMatches++;
			
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
    
    const stats = {
        totalMatches: 0,
        groups: {}
    };
    
    const settings =
		await chrome.storage.local.get(
			"wholeWordOnly"
		);
	
	const wholeWordOnly =
		settings.wholeWordOnly === true;

    groups.forEach(group => {
    	
    	stats.groups[group.label] = 0;
    	
        const regex =
			getRegex(
				group,
				wholeWordOnly
			);

        highlightGroup(
            regex,
            group.color,
            group.label,
			stats
        );
    });
    
    const score =
		calculateRelevanceScore(
			stats
		);
	
	renderStatsPanel(
		score,
		stats
	);
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