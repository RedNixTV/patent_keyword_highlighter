import {
    loadSettings,
    saveGroups,
    saveSettings
} from "./storage.js";

import {
    importProfile,
    createProfileData,
    parseProfileFile,
    createProfileBlob,
    createProfileFileName
} from "./profiles.js";

import {
    saveProfileName,
    applySettingsToUI
} from "./settings.js";

export function setupExportHandler({
    getGroups
}) {
		document.getElementById("exportBtn")
		.addEventListener("click", async () => {
	
			const settings = await loadSettings();
	
			const exportData =
				createProfileData({
					profileName:
						saveProfileName()||
						"Patent Search Profile",
			
					groups,
			
					autoHighlight:
						settings.autoHighlight,
			
					wholeWordOnly:
						settings.wholeWordOnly
				});
				
			const blob =
				createProfileBlob(
					exportData
				);
	
			const url =
				URL.createObjectURL(blob);
	
			const a =
				document.createElement("a");
	
			a.href = url;
	
			a.download =
				createProfileFileName(
					exportData.profileName
				);
	
			a.click();
	
			URL.revokeObjectURL(url);
		});
}

export function setupImportHandler({
    setGroups,
    refreshGroups
}) {
		document.getElementById("importBtn")
		.addEventListener("click", () => {
	
			document
				.getElementById("importFile")
				.click();
		});
		
		document.getElementById("importFile")
			.addEventListener("change", async (e) => {
		
				const file =
					e.target.files[0];
		
				if (!file) {
					return;
				}
	
		
				try {
		
					const data =
							await parseProfileFile(
								file
							);
						
						const profile =
							await importProfile(
								data
							);
						
						setGroups(
							profile.groups
						);
						
						await saveGroups(groups);
						
						await saveSettings({
						
							profileName:
								profile.profileName || "",
						
							autoHighlight:
								profile.autoHighlight ?? true,
						
							wholeWordOnly:
								profile.wholeWordOnly ?? false
						});
						
						applySettingsToUI({
						
							autoHighlight:
								profile.autoHighlight ?? true,
						
							wholeWordOnly:
								profile.wholeWordOnly ?? false,
						
							profileName:
								profile.profileName || ""
						});
						
						refreshGroups();
						
						alert(
							"Profile imported successfully."
						);
				} catch {
		
					alert(
						"Unable to import profile."
					);
				}
		
				e.target.value = "";
			});
}