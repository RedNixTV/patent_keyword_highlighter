document.addEventListener("DOMContentLoaded", async () => {

    const saved = await chrome.storage.local.get([
        "group1",
        "group2",
        "group3"
    ]);

    document.getElementById("group1").value =
        saved.group1 || "";

    document.getElementById("group2").value =
        saved.group2 || "";

    document.getElementById("group3").value =
        saved.group3 || "";
});

document.getElementById("highlightBtn").addEventListener("click", async () => {

    try {

        const group1 =
            document.getElementById("group1").value;

        const group2 =
            document.getElementById("group2").value;

        const group3 =
            document.getElementById("group3").value;

        // SAVE KEYWORDS

        await chrome.storage.local.set({
            group1,
            group2,
            group3
        });

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        chrome.tabs.sendMessage(
            tab.id,
            {
                action: "highlight",
                keywords: {
                    group1: group1
                        .split(",")
                        .map(k => k.trim())
                        .filter(Boolean),

                    group2: group2
                        .split(",")
                        .map(k => k.trim())
                        .filter(Boolean),

                    group3: group3
                        .split(",")
                        .map(k => k.trim())
                        .filter(Boolean)
                }
            },
            () => {

                if (chrome.runtime.lastError) {

                    console.error(
                        chrome.runtime.lastError.message
                    );

                    return;
                }

                window.close();
            }
        );

    } catch (error) {

        console.error(error);
    }
});

document.getElementById("clearBtn").addEventListener("click", async () => {

    try {

        // CLEAR STORAGE

        await chrome.storage.local.remove([
            "group1",
            "group2",
            "group3"
        ]);

        document.getElementById("group1").value = "";
        document.getElementById("group2").value = "";
        document.getElementById("group3").value = "";

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        chrome.tabs.sendMessage(
            tab.id,
            {
                action: "clear"
            },
            () => {

                if (chrome.runtime.lastError) {

                    console.error(
                        chrome.runtime.lastError.message
                    );

                    return;
                }

                window.close();
            }
        );

    } catch (error) {

        console.error(error);
    }
});