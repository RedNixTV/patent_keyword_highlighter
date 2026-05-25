document.addEventListener("DOMContentLoaded", async () => {

    // -----------------------------------
    // PRESET COLOR BUTTONS
    // -----------------------------------

    document.querySelectorAll(".preset-btn").forEach(button => {

        button.addEventListener("click", () => {

            const target =
                button.dataset.target;

            const color =
                button.dataset.color;

            document.getElementById(target).value =
                color;
        });
    });

    // -----------------------------------
    // LOAD SAVED SETTINGS
    // -----------------------------------

    const saved = await chrome.storage.local.get([
        "group1",
        "group2",
        "group3",
        "color1",
        "color2",
        "color3"
    ]);

    document.getElementById("group1").value =
        saved.group1 || "";

    document.getElementById("group2").value =
        saved.group2 || "";

    document.getElementById("group3").value =
        saved.group3 || "";

    document.getElementById("color1").value =
        saved.color1 || "#ff0000";

    document.getElementById("color2").value =
        saved.color2 || "#00aa00";

    document.getElementById("color3").value =
        saved.color3 || "#8000ff";

    // -----------------------------------
    // HIGHLIGHT BUTTON
    // -----------------------------------

    document.getElementById("highlightBtn").addEventListener("click", async () => {

        try {

            const group1 =
                document.getElementById("group1").value;

            const group2 =
                document.getElementById("group2").value;

            const group3 =
                document.getElementById("group3").value;

            const color1 =
                document.getElementById("color1").value;

            const color2 =
                document.getElementById("color2").value;

            const color3 =
                document.getElementById("color3").value;

            // SAVE SETTINGS

            await chrome.storage.local.set({
                group1,
                group2,
                group3,
                color1,
                color2,
                color3
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
                        group1: group1.split(",").map(k => k.trim()).filter(Boolean),
                        group2: group2.split(",").map(k => k.trim()).filter(Boolean),
                        group3: group3.split(",").map(k => k.trim()).filter(Boolean)
                    },

                    colors: {
                        group1: color1,
                        group2: color2,
                        group3: color3
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

    // -----------------------------------
    // CLEAR BUTTON
    // -----------------------------------

    document.getElementById("clearBtn").addEventListener("click", async () => {

        try {

            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

            chrome.tabs.sendMessage(
                tab.id,
                {
                    action: "clear"
                }
            );

        } catch (error) {

            console.error(error);
        }
    });
});