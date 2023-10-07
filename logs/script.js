document.addEventListener("DOMContentLoaded", function () {
    fetch("logs.json")
        .then(response => response.json())
        .then(data => {
            const versions = Object.keys(data)
                .sort((a, b) => a.localeCompare(b));
            const versionUL = document.getElementById("version-ul");

            versions.forEach(version => {
                const li = document.createElement("li");
                const p = document.createElement("a");
				p.textContent = version;
				li.dataset.version = version;
				li.appendChild(p);
                li.addEventListener("click", () => {
                    Array.from(versionUL.getElementsByTagName("li"))
                        .forEach(b => b.classList.remove("selected"));
                    li.classList.add("selected");
                    displayUpdateLog(data, version);
                });
                versionUL.appendChild(li);
            });
			
			//有数据是自动选择第一项
			if (versions.length !== 0) {
				Array.from(versionUL.getElementsByTagName("li"))[0].classList.add("selected");
				displayUpdateLog(data, versions[0]);
			}	
			
			//对比工具
            const oldVersionSelect = document.getElementById("old-version");
            const newVersionSelect = document.getElementById("new-version");

            versions.forEach(version => {
                const option1 = document.createElement("option");
                option1.value = version;
                option1.textContent = version;
                oldVersionSelect.appendChild(option1);
            });

            oldVersionSelect.addEventListener("change", () => {
                fillNewVersionSelect(versions, oldVersionSelect.value);

                const newVersionOptions = newVersionSelect.getElementsByTagName("option");
                if (newVersionOptions.length === 0) {
                    const updateLogContainer = document.getElementById("update-log");
                    Array.from(versionUL.getElementsByTagName("li"))
                        .forEach(b => b.classList.remove("selected"));
                    updateLogContainer.innerHTML = "";

                } else if (newVersionOptions.length === 1) {
                    newVersionSelect.selectedIndex = 0;
                    const oldVersion = oldVersionSelect.value;
                    const newVersion = newVersionSelect.value;
                    Array.from(versionUL.getElementsByTagName("li"))
                        .forEach(b => b.classList.remove("selected"));
                    compareUpdateLog(data, oldVersion, newVersion);
                }
            });
            newVersionSelect.addEventListener("change", () => {
                Array.from(versionUL.getElementsByTagName("li"))
                    .forEach(b => b.classList.remove("selected"));
                compareUpdateLog(data, oldVersionSelect.value, newVersionSelect.value);
            });
            fillNewVersionSelect(versions, "0", data);
        })
        .catch(error => console.error("Error loading update log:", error));
});

function fillNewVersionSelect(versions, selectedVersion, data) {
    const newVersionSelect = document.getElementById("new-version");
    newVersionSelect.innerHTML = "";

    let inRange = selectedVersion === "0";
    versions.forEach(version => {
        if (inRange) {
            const option = document.createElement("option");
            option.value = version;
            option.textContent = version;
            newVersionSelect.appendChild(option);
        }
        if (version === selectedVersion) {
            inRange = true;
        }
    });
}

function displayUpdateLog(updateData, version) {
    const updateLogContainer = document.getElementById("update-log");
    updateLogContainer.innerHTML = "";

    const updates = updateData[version];
    if (updates.length > 0) {
		updates.sort((a, b) => a.page - b.page);
        updates.forEach(update => appendUpdateLog(updateLogContainer, update));
    }
}

function compareUpdateLog(updateData, oldVersion, newVersion) {
    const updateLogContainer = document.getElementById("update-log");
    updateLogContainer.innerHTML = "";

    const versionsToShow = getVersionRange(updateData, oldVersion, newVersion);
	const allUpdates = [];

    versionsToShow.forEach(version => {
        const updates = updateData[version];
        if (updates.length > 0) {
            allUpdates.push(...updates);
        }
    });

    allUpdates.sort((a, b) => a.page - b.page);
    allUpdates.forEach(update => {
        appendUpdateLog(updateLogContainer, update);
    });
}

function appendUpdateLog(container, update) {
    const updateElement = document.createElement("div");
    updateElement.classList.add("update-version");

    const pageElement = document.createElement("div");
    pageElement.classList.add("page-number");
    pageElement.innerText = `页 ${update.page}`;
    updateElement.appendChild(pageElement);

    const preUpdate = document.createElement("div");
    preUpdate.classList.add("update-text");
    preUpdate.innerText = update.pre;
    updateElement.appendChild(preUpdate);

    const arrowElement = document.createElement("div");
    arrowElement.classList.add("arrow");
    const i = document.createElement("i");
	i.classList.add("fas");
	i.classList.add("fa-angle-right");
	arrowElement.appendChild(i);
    updateElement.appendChild(arrowElement);

    const postUpdate = document.createElement("div");
    postUpdate.classList.add("update-text");
    postUpdate.innerText = update.post;
    updateElement.appendChild(postUpdate);

    container.appendChild(updateElement);
}

function getVersionRange(updateData, oldVersion, newVersion) {
    const versions = Object.keys(updateData)
        .sort((a, b) => (updateData[a][0] ? a.page || 0 : 0) - (updateData[b][0] ? b.page || 0 : 0));
    let inRange = oldVersion === "0";
    const versionsToShow = [];

    for (const version of versions) {
        if (inRange) {
            versionsToShow.push(version);
        }
        if (version === oldVersion) {
            inRange = true;
        }
        if (version === newVersion) {
            break;
        }
    }

    return versionsToShow;
}
