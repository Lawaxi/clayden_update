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
			
			//对比工具
            const oldVersionSelect = document.getElementById("old-version");
            const newVersionSelect = document.getElementById("new-version");
			
			if (versions.length >= 2) {
                const oldVersion = versions[versions.length - 2];
                const newVersion = versions[versions.length - 1];
            
                oldVersionSelect.value = oldVersion;
                fillNewVersionSelect(versions, oldVersion, data);
                newVersionSelect.value = newVersion;
            
                compareUpdateLog(data, oldVersion, newVersion);
            }

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

var currentUpdates = [];

function displayUpdateLog(updateData, version) {
    const updateLogContainer = document.getElementById("update-log");
    updateLogContainer.innerHTML = "";

    const updates = updateData[version];
    if (updates.length > 0) {
		updates.sort(comparePages);
		currentUpdates = updates;
		displayCurrentUpdates();
    }
}

function compareUpdateLog(updateData, oldVersion, newVersion) {
    const versionsToShow = getVersionRange(updateData, oldVersion, newVersion);
	const allUpdates = [];

    versionsToShow.forEach(version => {
        const updates = updateData[version];
        if (updates.length > 0) {
            allUpdates.push(...updates);
        }
    });

    if (allUpdates.length > 0) {
		allUpdates.sort(comparePages);
		currentUpdates = allUpdates;
		displayCurrentUpdates();
	}
}

function displayCurrentUpdates(){
    const updateLogContainer = document.getElementById("update-log");
    updateLogContainer.innerHTML = "";
    currentUpdates.forEach(update => appendUpdateLog(updateLogContainer, update));
}

function appendUpdateLog(container, update) {
	if (!toggleShowAllUpdates.checked && update.type === 0) {
        return;
    }
	
    const updateElement = document.createElement("div");
    updateElement.classList.add("update-version");
    updateElement.classList.add(`risk-${update.type}`);

    const typeElement = document.createElement("div");
    typeElement.classList.add("update-type");
	typeElement.innerHTML = `<i class="fas fa-${update.type ? 'exclamation' : 'ghost'}"></i>`;
    updateElement.appendChild(typeElement);
	
    const pageElement = document.createElement("div");
    pageElement.classList.add("page-number");
    pageElement.innerText = update.page === 0
    ? `页 ${update.page1}`
    : `页 ${update.page}`;
    updateElement.appendChild(pageElement);

    const preUpdate = document.createElement("div");
    preUpdate.classList.add("update-text");
    preUpdate.innerText = update.pre;
    updateElement.appendChild(preUpdate);

    const arrowElement = document.createElement("div");
    arrowElement.classList.add("arrow");
	arrowElement.innerHTML = '<i class="fas fa-angle-right"></i>';
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

const toggleShowAllUpdates = document.getElementById("show-all-updates");
toggleShowAllUpdates.addEventListener("change", function () {
    displayCurrentUpdates();
});

function romanToNumber(roman) {
    const map = { i:1, v:5, x:10, l:50, c:100 };
    let result = 0, prev = 0;

    roman = roman.toLowerCase();
    for (let i = roman.length - 1; i >= 0; i--) {
        const val = map[roman[i]] || 0;
        if (val < prev) result -= val;
        else result += val;
        prev = val;
    }
    return result;
}

function comparePages(a, b) {
    if (a.page !== 0 && b.page !== 0) {
        return a.page - b.page;
    }
    if (a.page !== 0) return 1;
    if (b.page !== 0) return -1;
    if (a.page1 && b.page1 && /^[ivxlc]+$/i.test(a.page1) && /^[ivxlc]+$/i.test(b.page1)) {
        return romanToNumber(a.page1) - romanToNumber(b.page1);
    }

    return 0;
}