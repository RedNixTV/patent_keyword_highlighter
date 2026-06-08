console.log("CONTENT SCRIPT LOADED");
// Cache compiled regex objects so they can be reused
// across multiple highlight runs.
const regexCache = new Map();
const expandedStatsGroups = new Set();

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

function getRegex(searchTerms, wholeWordOnly) {

    const key =
    		`${wholeWordOnly}|` +
			[...searchTerms]
				.sort()
				.join(",");

    if (!regexCache.has(key)) {

        regexCache.set(
            key,
            buildRegex(
				searchTerms,
				wholeWordOnly
			)
        );
    }

    return regexCache.get(key);
}

function buildRegex(
    searchTerms,
    wholeWordOnly
) {

    if (!searchTerms.length) {
        return null;
    }

    const pattern =
		[...searchTerms]
			.sort(
				(a, b) =>
					b.length - a.length
			)
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

async function renderStatsPanel(
    stats,
    groups
) {

    removeStatsPanel();
    
    const structuralScore =
		`${stats.structural.achievedWeight} / ${stats.structural.totalWeight}`;
	
	const criticalScore =
		`${stats.structural.matchedCritical} / ${stats.structural.totalCritical}`;

    const sortedGroups =
        Object.entries(stats.groups)
            .sort((a, b) => b[1] - a[1]);

    const colorMap =
        Object.fromEntries(
            groups.map(group => [
                group.label,
                group.color
            ])
        );

    const panel =
        document.createElement("div");
    
    const savedSettings =
		await chrome.storage.local.get([
			"statsPanelLeft",
			"statsPanelTop",
			"analysisScope",
			"activeKeywordMode",
			"statsPanelWidth"
		]);
		
	panel.style.width =
		savedSettings.statsPanelWidth ||
		"460px";

    panel.id =
        "patent-relevance-panel";
        
    const activeKeywordMode =
		savedSettings.activeKeywordMode ||
		"single";
		
	const totalKeywords =
		groups.reduce(
			(sum, group) =>
				sum +
				(
					activeKeywordMode === "phrase"
						? (group.phrases?.length || 0)
						: (group.keywords?.length || 0)
				),
			0
		);
	
	const matchedKeywords =
		Object.values(stats.keywords)
			.reduce(
				(sum, keywordMap) =>
					sum +
					Object.keys(keywordMap).length,
				0
			);
	
	const vocabularyPct =
		totalKeywords > 0
			? (
				matchedKeywords /
				totalKeywords
			) * 100
			: 0;
	
	const structurePct =
		stats.structural.totalWeight > 0
			? (
				stats.structural.achievedWeight /
				stats.structural.totalWeight
			) * 100
			: 0;
	
	let relevanceLabel;
	
	if (
		vocabularyPct >= 60 &&
		structurePct >= 60
	) {
	
		relevanceLabel =
			"Strong Match";
	}
	else if (
		vocabularyPct >= 60 &&
		structurePct < 60
	) {
	
		relevanceLabel =
			"Same Terms, Diff Invention";
	}
	else if (
		vocabularyPct < 60 &&
		structurePct >= 60
	) {
	
		relevanceLabel =
			"Different terms, Similar Invention";
	}
	else {
	
		relevanceLabel =
			"Weak Match";
	}
		
	const structuralLabel =
		activeKeywordMode === "phrase"
			? "Structural"
			: "Keyword Coverage";
	
	const criticalLabel =
		activeKeywordMode === "phrase"
			? "Critical"
			: "Keyword Critical";
		
	const activeTabStyle = `
		flex:1;
		padding:4px 8px;
		margin:0;
		font-size:11px;
		cursor:pointer;
		background:#ffffff;
		border:1px solid #ccc;
		border-bottom:2px solid #ffffff;
		border-radius:4px 4px 0 0;
		font-weight:bold;
	`;
	
	const inactiveTabStyle = `
		flex:1;
		padding:4px 8px;
		margin:0;
		font-size:11px;
		cursor:pointer;
		background:#f3f3f3;
		border:1px solid #ccc;
		border-bottom:1px solid #ccc;
		border-radius:4px 4px 0 0;
		font-weight:normal;
	`;

    panel.style.position = "fixed";
	
	if (
		savedSettings.statsPanelLeft &&
		savedSettings.statsPanelTop
	) {
	
		panel.style.left =
			savedSettings.statsPanelLeft;
	
		panel.style.top =
			savedSettings.statsPanelTop;
	
		panel.style.right =
			"auto";
	}
	else {
	
		panel.style.top = "10px";
		panel.style.right = "10px";
	}
	
    panel.style.zIndex = "2147483647";
    panel.style.isolation = "isolate";
    panel.style.pointerEvents = "auto";
    panel.style.background = "#ffffff";
    panel.style.border = "1px solid #ccc";
    panel.style.borderRadius = "8px";
    panel.style.boxShadow =
        "0 4px 12px rgba(0,0,0,.15)";
    panel.style.resize = "both";
	panel.style.overflow = "auto";
    panel.style.fontSize = "13px";
    panel.style.fontFamily = "Arial, sans-serif";
    
    const rowsHtml =
		sortedGroups
			.map(([label, count]) => {
	
				const expanded =
					expandedStatsGroups.has(
						label
					);
					
				const group =
					groups.find(
						g => g.label === label
					);
				
				const totalKeywords =
					activeKeywordMode === "phrase"
						? (group?.phrases?.length || 0)
						: (group?.keywords?.length || 0);
				
				const uniqueMatched =
					Object.keys(
						stats.keywords[label] || {}
					).length;
				
				const coveragePct =
					totalKeywords > 0
						? Math.round(
							uniqueMatched /
							totalKeywords *
							100
						)
						: 0;
	
				const keywords =
					Object.entries(
						stats.keywords[label] || {}
					)
					.sort(
						(a, b) =>
							b[1] - a[1]
					);
					
				const rows = [];
				
				const midpoint =
					Math.ceil(
						keywords.length / 2
					);
				
				for (
					let i = 0;
					i < midpoint;
					i++
				) {
				
					rows.push([
						keywords[i],
						keywords[i + midpoint]
					]);
				
				}
    
				const keywordRows =
						rows
							.map(
								([left, right]) => {
					
									const leftHtml =
											left
												? `
													<div
														style="
															flex:1;
															display:flex;
															justify-content:space-between;
														"
													>
										
														<span>
															${left[0]}
														</span>
										
														<span>
															${left[1]}
														</span>
										
													</div>
												`
												: "";
					
									const rightHtml =
											right
												? `
													<div
														style="
															flex:1;
															display:flex;
															justify-content:space-between;
														"
													>
										
														<span>
															${right[0]}
														</span>
										
														<span>
															${right[1]}
														</span>
										
													</div>
												`
												: "";
															
									return `
										<div
											style="
												display:flex;
												gap:12px;
												margin-bottom:4px;
												padding-left:18px;
											"
										>
					
											${leftHtml}
					
											${rightHtml}
					
										</div>
									`;
								}
							)
							.join("");
	
				return `
					<div>
	
						<div
							class="stats-group-header"
							data-label="${label}"
							style="
								display:flex;
								justify-content:space-between;
								margin-bottom:6px;
								cursor:pointer;
							"
						>
	
							<span
								style="
									color:${colorMap[label]};
									font-weight:bold;
								"
							>
								${
									expanded
										? "▼"
										: "▶"
								}
	
								${label}
							</span>
	
							<span
								style="
									white-space:nowrap;
									font-size:12px;
								"
							>
								${uniqueMatched}/${totalKeywords}
								(${coveragePct}%)
								|
								${count} hits
							</span>
	
						</div>
	
						${
							expanded
								? keywordRows
								: ""
						}
	
					</div>
				`;
			})
			.join("");

    panel.innerHTML = `
        <div
            id="statsHeader"
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                background:#f5f5f5;
                padding:10px;
                cursor:move;
                border-bottom:1px solid #ddd;
            "
        >

            <div>
                <span
                    id="toggleStatsPanel"
                    style="
                        cursor:pointer;
                        margin-right:8px;
                    "
                >
                    ▼
                </span>

                <div
					style="
						display:flex;
						flex-direction:column;
						gap:4px;
					"
				>
					<strong>
						Patent Profile Match
					</strong>
				
					<div
						style="
							display:flex;
							justify-content:space-between;
							align-items:center;
							gap:12px;
						"
					>
					
						<select
							id="statsScopeSelect"
							style="
								width:160px;
								font-size:12px;
							"
						>
							<option value="all">
								Entire Patent
							</option>
					
							<option value="biblio">
								Biblio
							</option>
					
							<option value="claims">
								Claims
							</option>
					
							<option value="description">
								Description
							</option>
					
							<option value="claimsDescription">
								Claims + Description
							</option>
						</select>
					
						<div
							style="
								font-size:11px;
								font-weight:bold;
								white-space:nowrap;
							"
						>
							Relevance:
							${relevanceLabel}
						</div>
					
					</div>
					
					<div
						style="
							display:flex;
							justify-content:space-between;
							align-items:center;
							gap:12px;
							margin-top:6px;
						"
					>
							<div
								style="
									display:flex;
									gap:1px;
									flex:1;
								"
							>
							
								<button
									id="statsSingleModeBtn"
									style="${
										activeKeywordMode === "single"
											? activeTabStyle
											: inactiveTabStyle
									}"
								>
									Single Words
								</button>
							
								<button
									id="statsPhraseModeBtn"
									style="${
										activeKeywordMode === "phrase"
											? activeTabStyle
											: inactiveTabStyle
									}"
								>
									Phrases
								</button>
							
							</div>
							
							<div
								style="
									font-size:11px;
									white-space:nowrap;
								"
							>
								<strong>
									${structuralLabel}:
								</strong>
								${structuralScore}
							
								&nbsp;&nbsp;
							
								<strong>
									${criticalLabel}:
								</strong>
								${criticalScore}
							</div>
						</div>
						<div
							style="
								border-bottom:1px solid #ccc;
								margin-top:-1px;
							"
						></div>
				</div>
            </div>

            <button
                id="closeStatsPanel"
                style="
                    width:auto;
                    margin:0;
                    padding:2px 8px;
                "
            >
                ✕
            </button>

        </div>

        <div
            id="statsBody"
            style="
                padding:10px;
            "
        >

            ${rowsHtml}

            <hr>

            <div
                style="
                    font-weight:bold;
                    text-align:right;
                "
            >
                Total Matches:
                ${stats.totalMatches}
            </div>

        </div>
    `;

    document.documentElement.appendChild(panel);
    
    panel
		.querySelectorAll(
			".stats-group-header"
		)
		.forEach(header => {
	
			header.addEventListener(
				"click",
				() => {
	
					const label =
						header.dataset.label;
	
					if (
						expandedStatsGroups.has(
							label
						)
					) {
	
						expandedStatsGroups.delete(
							label
						);
	
					} else {
	
						expandedStatsGroups.add(
							label
						);
	
					}
	
					renderStatsPanel(
						stats,
						groups
					);
				}
			);
	
		});
    
    const scopeSelect =
		panel.querySelector(
			"#statsScopeSelect"
		);
	
	scopeSelect.value =
		savedSettings.analysisScope || "all";
		
	scopeSelect.addEventListener(
			"change",
			async e => {
		
				await chrome.storage.local.set({
		
					analysisScope:
						e.target.value
				});
		
				const saved =
					await chrome.storage.local.get(
						"groups"
					);
		
				applyHighlights(
					(saved.groups || [])
						.filter(
							group => group.enabled
						)
				);
			}
		);
		
	const singleModeBtn =
			panel.querySelector(
				"#statsSingleModeBtn"
			);
		
		const phraseModeBtn =
			panel.querySelector(
				"#statsPhraseModeBtn"
			);
		
		singleModeBtn.addEventListener(
			"click",
			async () => {
		
				await chrome.storage.local.set({
					activeKeywordMode:
						"single"
				});
		
				const saved =
					await chrome.storage.local.get(
						"groups"
					);
		
				applyHighlights(
					(saved.groups || [])
						.filter(
							group => group.enabled
						)
				);
			}
		);
		
		phraseModeBtn.addEventListener(
			"click",
			async () => {
		
				await chrome.storage.local.set({
					activeKeywordMode:
						"phrase"
				});
		
				const saved =
					await chrome.storage.local.get(
						"groups"
					);
		
				applyHighlights(
					(saved.groups || [])
						.filter(
							group => group.enabled
						)
				);
			}
		);

    // -----------------------------
    // CLOSE
    // -----------------------------

    panel.querySelector(
        "#closeStatsPanel"
    ).addEventListener(
        "click",
        () => panel.remove()
    );

    // -----------------------------
    // COLLAPSE
    // -----------------------------

    const toggle =
        panel.querySelector(
            "#toggleStatsPanel"
        );

    const body =
        panel.querySelector(
            "#statsBody"
        );

    toggle.addEventListener(
        "click",
        () => {

            const hidden =
                body.style.display === "none";

            body.style.display =
                hidden
                    ? "block"
                    : "none";

            toggle.textContent =
                hidden
                    ? "▼"
                    : "▶";
        }
    );

    // -----------------------------
    // DRAGGING
    // -----------------------------

    const header =
        panel.querySelector(
            "#statsHeader"
        );

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener(
        "mousedown",
        e => {

            dragging = true;

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
        e => {

            if (!dragging) {
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

            if (!dragging) {
                return;
            }

            dragging = false;
            
            chrome.storage.local.set({
				statsPanelLeft: panel.style.left,
				statsPanelTop: panel.style.top,
				statsPanelWidth: `${panel.offsetWidth}px`,
			});
        }
    );
}

function highlightGroup(regex, color, groupLabel, stats, root, searchTerms) {

    if (!regex) {
        return;
    }

    const walker = document.createTreeWalker(
        root,
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
			
			const matchedKeyword =
				match[0].toLowerCase();
			
			stats.keywords[groupLabel][matchedKeyword] =
				(
					stats.keywords[groupLabel][matchedKeyword] || 0
				) + 1;
			
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

function getAnalysisRoots(scope) {

    switch (scope) {

        case "biblio":

            return [
                document.getElementById(
                    "abstract_content"
                )
            ];

        case "claims":

            return [
                document.getElementById(
                    "claims_content"
                )
            ];

        case "description":

            return [
                document.getElementById(
                    "description_content"
                )
            ];

        case "claimsDescription":

            return [
                document.getElementById(
                    "claims_content"
                ),
                document.getElementById(
                    "description_content"
                )
            ];

        default:

            return [document.body];
    }
}

async function applyHighlights(groups)  {

    clearHighlights();
    
    const stats = {
		totalMatches: 0,
		groups: {},
		keywords: {},
	
		structural: {
			achievedWeight: 0,
			totalWeight: 0,
			matchedCritical: 0,
			totalCritical: 0
		}
	};
    
    const settings =
		await chrome.storage.local.get([
			"wholeWordOnly",
			"analysisScope",
			"activeKeywordMode"
		]);
		
	const activeKeywordMode =
		settings.activeKeywordMode ||
		"single";
		
	const roots =
		getAnalysisRoots(
			settings.analysisScope
		);
	
	const wholeWordOnly =
		settings.wholeWordOnly === true;
		
	groups.forEach(group => {
	
		stats.structural.totalWeight +=
			group.weight || 0;
	
		if (group.critical) {
	
			stats.structural.totalCritical++;
		}
	});

    groups.forEach(group => {
    	
    	stats.groups[group.label] = 0;
    	stats.keywords[group.label] = {};
    	
    	const searchTerms =
			activeKeywordMode === "phrase"
				? group.phrases
				: group.keywords;
    	
        const regex =
			getRegex(
				searchTerms,
				wholeWordOnly
			);

        roots.forEach(root => {
			
				if (!root) {
					return;
				}
			
				highlightGroup(
					regex,
					group.color,
					group.label,
					stats,
					root,
					searchTerms
				);
			});
			
		let matched;
		
		if (
			activeKeywordMode === "phrase"
		) {
		
			matched =
				stats.groups[group.label] > 0;
		
		}
		else {
		
			const threshold =
				Math.max(
					5,
					(group.weight || 0) * 5
				);
		
			matched =
				stats.groups[group.label] >=
				threshold;
		}
		
		if (matched) {
		
			stats.structural.achievedWeight +=
				group.weight || 0;
		
			if (group.critical) {
		
				stats.structural.matchedCritical++;
			}
		}
    });
	
	await renderStatsPanel(
		stats,
		groups
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