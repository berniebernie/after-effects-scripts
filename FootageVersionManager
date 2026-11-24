/*
Tool to help replacing footages with more recent versions.
Totally gemini vibe-coded.
*/
(function(thisObj) {
	var UI_CONFIG = {
		panelTitle: "Footage Version Manager 0.91",
		warningDiskAccess: "⚠️ WARNING: 'Allow Scripts to Write Files and Access Network' is disabled in Preferences > Scripting & Expressions.",
		addGroupTitle: "Add Footage",
		actionGroupTitle: "Batch Actions",
		listHeaderTitle: "Managed Footage Items",
		defaultFilterText: "*.exr",
		defaultDropdownItem: "Select version...",
		noVersionsItem: "No versions",
		initDebugLabel: "[Init]",

		labels: {
			selectAll: "Select All",
			selectNone: "Select None",
			addSelected: "Add selected",
			addAllWithFilter: "Add all with filter:",
			checkBatch: "Check",
			highestBatch: "Highest",
			clearBatch: "Clear",
			debugCheckbox: "debug",
			writeCsv: "Write CSV",
			loadCsv: "Load CSV",
			rowCheck: "🔍",
			rowUpdate: "⬆️",
			rowBrowse: "📂",
			rowShowInProject: "🎯",
			rowRemove: "❌"
		},

		helpTips: {
			filterInput: "use * to select all footage in project, *.mp4 or such",
			selectAllCb: "select all Items in the list",
			addSelectedBtn: "add currently selected footage to the list",
			addAllBtn: "add all footages from project in the list using filter",
			checkSelectedBtn: "check if selected items have older or newer versions on disk",
			useHighestBtn: "use highest found version for all selected items",
			clearSelectedBtn: "clear items from list",
			debugCb: "show debugging info",
			writeCsvBtn: "writes filepaths to a .csv file to batch edit footage locations",
			loadCsvBtn: "load edited .csv file once saved",
			patternInput: "",
			dropdown: "",
			rowCheckBtn: "check for footage",
			rowUpdateBtn: "update to selected version",
			rowBrowseBtn: "open file explorer",
			rowShowInProjectBtn: "show in project",
			rowRemoveBtn: "remove from list"
		}
	};

	function buildFootageManagerPanel(parentObj) {
		var panel = (parentObj instanceof Panel) ? parentObj : new Window("palette", UI_CONFIG.panelTitle, undefined, {
			resizeable: true
		});
		panel.orientation = "column";
		panel.alignChildren = ["fill", "fill"];
		panel.spacing = 10;
		panel.margins = 15;

		var warningText = panel.add("statictext", undefined, UI_CONFIG.warningDiskAccess);
		warningText.alignment = ["fill", "top"];
		warningText.graphics.foregroundColor = warningText.graphics.newPen(warningText.graphics.PenType.SOLID_COLOR, [1, 0, 0, 1], 1);
		warningText.visible = false;

		function checkDiskAccessPref() {
			try {
				var prefValue = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
				if (prefValue === 0) {
					warningText.visible = true;
				} else {
					warningText.visible = false;
				}
			} catch (e) {
				warningText.visible = false;
			}
		}
		checkDiskAccessPref();

		var topActionGroup = panel.add("group", undefined);
		topActionGroup.orientation = "row";
		topActionGroup.alignChildren = ["fill", "center"];
		topActionGroup.spacing = 10;

		var addGroup = topActionGroup.add("panel", undefined, UI_CONFIG.addGroupTitle);
		addGroup.orientation = "row";
		addGroup.alignChildren = ["left", "center"];
		addGroup.spacing = 8;
		addGroup.margins = 10;

		var addSelectedBtn = addGroup.add("button", undefined, UI_CONFIG.labels.addSelected);
		addSelectedBtn.helpTip = UI_CONFIG.helpTips.addSelectedBtn;

		var addAllBtn = addGroup.add("button", undefined, UI_CONFIG.labels.addAllWithFilter);
		addAllBtn.helpTip = UI_CONFIG.helpTips.addAllBtn;

		var filterInput = addGroup.add("edittext", undefined, UI_CONFIG.defaultFilterText);
		filterInput.size = [60, 25];
		filterInput.helpTip = UI_CONFIG.helpTips.filterInput;

		var actionGroup = topActionGroup.add("panel", undefined, UI_CONFIG.actionGroupTitle);
		actionGroup.orientation = "row";
		actionGroup.alignChildren = ["right", "center"];
		actionGroup.spacing = 8;
		actionGroup.margins = 10;

		var selectAllCb = actionGroup.add("checkbox", undefined, UI_CONFIG.labels.selectAll);
		selectAllCb.helpTip = UI_CONFIG.helpTips.selectAllCb;

		var checkSelectedBtn = actionGroup.add("button", undefined, UI_CONFIG.labels.checkBatch);
		checkSelectedBtn.helpTip = UI_CONFIG.helpTips.checkSelectedBtn;

		var useHighestBtn = actionGroup.add("button", undefined, UI_CONFIG.labels.highestBatch);
		useHighestBtn.helpTip = UI_CONFIG.helpTips.useHighestBtn;

		var clearSelectedBtn = actionGroup.add("button", undefined, UI_CONFIG.labels.clearBatch);
		clearSelectedBtn.helpTip = UI_CONFIG.helpTips.clearSelectedBtn;

		var debugCb = actionGroup.add("checkbox", undefined, UI_CONFIG.labels.debugCheckbox);
		debugCb.helpTip = UI_CONFIG.helpTips.debugCb;

		var writeCsvBtn = actionGroup.add("button", undefined, UI_CONFIG.labels.writeCsv);
		writeCsvBtn.helpTip = UI_CONFIG.helpTips.writeCsvBtn;

		var loadCsvBtn = actionGroup.add("button", undefined, UI_CONFIG.labels.loadCsv);
		loadCsvBtn.helpTip = UI_CONFIG.helpTips.loadCsvBtn;

		var listGroup = panel.add("group", undefined);
		listGroup.orientation = "column";
		listGroup.alignChildren = ["fill", "fill"];
		listGroup.alignment = ["fill", "fill"];

		var listHeader = listGroup.add("statictext", undefined, UI_CONFIG.listHeaderTitle);
		listHeader.alignment = ["left", "top"];

		var scrollPanel = listGroup.add("panel", undefined, undefined, {
			scrollable: true
		});
		scrollPanel.orientation = "column";
		scrollPanel.alignChildren = ["fill", "top"];
		scrollPanel.alignment = ["fill", "fill"];

		var managedItems = [];

		function debugText(textVar) {
			if (debugCb.value) {
				writeLn(textVar);
			}
		}

		function matchWildcard(name, wildcard) {
			var exp = wildcard.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".");
			var regex = new RegExp("^" + exp + "$", "i");
			return regex.test(name);
		}

		function autoDetectPattern(filePath) {
			debugText("[DEBUG] autoDetectPattern -> Analyzing filepath: " + filePath);
			var normalized = filePath.replace(/\\/g, "/");
			var parts = normalized.split("/");
			if (parts.length < 3) return normalized;

			var fileName = parts[parts.length - 1];
			var fileMatch = fileName.match(/^([a-zA-Z]+?)(\d+)([\._\-\s]*)(v?)(\d+)([\._\-\s]*)(\d{4})(\.[^.]+)$/i);

			var verFolderIdx = parts.length - 2;
			var shotFolderIdx = parts.length - 3;

			var shotFolderName = shotFolderIdx >= 0 ? parts[shotFolderIdx] : "";
			var verFolderName = verFolderIdx >= 0 ? parts[verFolderIdx] : "";

			var shotFolderMatch = shotFolderName.match(/^([a-zA-Z]+?)(\d+)$/);
			var verFolderMatch = verFolderName.match(/^(v?)(\d+)$/i);

			var newVerFolder = verFolderName;
			if (verFolderMatch && (!shotFolderMatch || verFolderIdx !== shotFolderIdx)) {
				var vPrefix = verFolderMatch[1];
				var vDigits = verFolderMatch[2];
				var vHashes = "";
				for (var h = 0; h < vDigits.length; h++) {
					vHashes += "#";
				}
				newVerFolder = vPrefix + "{version" + vHashes + "}";
			}

			if (fileMatch) {
				var fShotName = fileMatch[1];
				var fShotNum = fileMatch[2];
				var sep1 = fileMatch[3];
				var vTag = fileMatch[4];
				var fVerNum = fileMatch[5];
				var sep2 = fileMatch[6];
				var frameDigits = fileMatch[7];
				var ext = fileMatch[8];

				if (shotFolderMatch) {
					fShotName = shotFolderMatch[1];
					fShotNum = shotFolderMatch[2];
				}

				var fVerHashes = "";
				for (var fh = 0; fh < fVerNum.length; fh++) {
					fVerHashes += "#";
				}

				var newFileName = fShotName + fShotNum + sep1 + vTag + "{version" + fVerHashes + "}" + sep2 + frameDigits + ext;

				if (verFolderMatch && (!shotFolderMatch || verFolderIdx !== shotFolderIdx)) {
					parts[verFolderIdx] = newVerFolder;
				}
				parts[parts.length - 1] = newFileName;

				var resultPattern = parts.join("/");
				debugText("[DEBUG] autoDetectPattern -> Shot kept as '" + fShotName + fShotNum + "', pattern: " + resultPattern);
				return resultPattern;
			}

			if (verFolderMatch && verFolderIdx >= 0) {
				parts[verFolderIdx] = newVerFolder;
			}
			debugText("[DEBUG] autoDetectPattern -> Fallback pattern: " + parts.join("/"));
			return parts.join("/");
		}

		function scanVersions(pattern, itemName) {
			debugText("[DEBUG] scanVersions -> Scanning for item: " + (itemName || "unknown") + " with pattern: " + pattern);
			var versions = [];
			var normalizedPattern = pattern.replace(/\\/g, "/");

			var placeholderRegex = /\{version(#*)\}/g;
			var placeholders = [];
			var match;
			while ((match = placeholderRegex.exec(normalizedPattern)) !== null) {
				placeholders.push({
					full: match[0],
					hashes: match[1],
					index: match.index
				});
			}

			if (placeholders.length === 0) {
				debugText("[DEBUG] scanVersions -> No {version...} placeholder found.");
				return versions;
			}

			function escapeRegex(str) {
				return str.replace(/([.\\+*?[^\\]$(){}=!<>|:])/g, "\\$1");
			}

			if (placeholders.length >= 2) {
				var folderPh = placeholders[0];
				var filePh = placeholders[1];

				var beforeFolderPh = normalizedPattern.substring(0, folderPh.index);
				var afterFolderPh = normalizedPattern.substring(folderPh.index + folderPh.full.length);

				var lastSlashBeforeFolder = beforeFolderPh.lastIndexOf("/");
				var parentOfVerFolder = lastSlashBeforeFolder !== -1 ? beforeFolderPh.substring(0, lastSlashBeforeFolder) : "";
				var folderPrefix = lastSlashBeforeFolder !== -1 ? beforeFolderPh.substring(lastSlashBeforeFolder + 1) : beforeFolderPh;

				var relFilePhIndex = afterFolderPh.indexOf(filePh.full);
				var pathAndFilePrefix = relFilePhIndex !== -1 ? afterFolderPh.substring(0, relFilePhIndex) : afterFolderPh;
				var fileSuffix = relFilePhIndex !== -1 ? afterFolderPh.substring(relFilePhIndex + filePh.full.length) : "";

				var lastSlashInFilePart = pathAndFilePrefix.lastIndexOf("/");
				var subDirRel = lastSlashInFilePart > 0 ? pathAndFilePrefix.substring(0, lastSlashInFilePart) : "";
				var fileNamePrefix = lastSlashInFilePart !== -1 ? pathAndFilePrefix.substring(lastSlashInFilePart + 1) : pathAndFilePrefix;

				debugText("[DEBUG] scanVersions -> ParentFolder: " + parentOfVerFolder + ", FolderPrefix: " + folderPrefix + ", FilePrefix: " + fileNamePrefix + ", FileSuffix: " + fileSuffix);

				var parentFolder = new Folder(parentOfVerFolder);
				if (parentFolder.exists) {
					var entries = parentFolder.getFiles();
					var folderDigitRule = folderPh.hashes.length > 0 ? "\\d{" + folderPh.hashes.length + "}" : "\\d+";
					var folderRegex = new RegExp("^" + escapeRegex(folderPrefix) + "(" + folderDigitRule + ")$", "i");

					var fileDigitRule = filePh.hashes.length > 0 ? "\\d{" + filePh.hashes.length + "}" : "\\d+";
					var fileRegex = new RegExp("^" + escapeRegex(fileNamePrefix) + "(" + fileDigitRule + ")" + escapeRegex(fileSuffix) + "$", "i");

					for (var i = 0; i < entries.length; i++) {
						if (entries[i] instanceof Folder) {
							var fMatch = entries[i].name.match(folderRegex);
							if (fMatch) {
								var folderVerDigits = fMatch[1];
								var targetDirPath = entries[i].fsName.replace(/\\/g, "/") + (subDirRel ? "/" + subDirRel : "");
								var targetDir = new Folder(targetDirPath);
								debugText("[DEBUG] scanVersions -> Matched version folder '" + entries[i].name + "', checking dir: " + targetDirPath);

								if (targetDir.exists) {
									var filesInVer = targetDir.getFiles();
									for (var j = 0; j < filesInVer.length; j++) {
										if (filesInVer[j] instanceof File) {
											var matchFile = filesInVer[j].name.match(fileRegex);
											if (matchFile) {
												var fileVerDigits = matchFile[1];
												if (parseInt(folderVerDigits, 10) === parseInt(fileVerDigits, 10)) {
													var labelVer = folderPrefix + folderVerDigits;
													debugText("[DEBUG] scanVersions -> MATCHED version '" + labelVer + "' -> " + filesInVer[j].fsName);
													versions.push({
														version: labelVer,
														path: filesInVer[j].fsName
													});
												}
											}
										}
									}
								}
							}
						}
					}
				} else {
					debugText("[DEBUG] scanVersions -> Parent folder does not exist: " + parentOfVerFolder);
				}
			} else {
				var ph = placeholders[0];
				var lastSlash = normalizedPattern.lastIndexOf("/");
				var folderPath = lastSlash !== -1 ? normalizedPattern.substring(0, lastSlash) : "";
				var fileTemplate = lastSlash !== -1 ? normalizedPattern.substring(lastSlash + 1) : normalizedPattern;

				var phInFileIdx = fileTemplate.indexOf(ph.full);
				if (phInFileIdx !== -1) {
					var folder = new Folder(folderPath);
					if (folder.exists) {
						var fPrefix = fileTemplate.substring(0, phInFileIdx);
						var fSuffix = fileTemplate.substring(phInFileIdx + ph.full.length);
						var dRule = ph.hashes.length > 0 ? "\\d{" + ph.hashes.length + "}" : "\\d+";
						var fRx = new RegExp("^" + escapeRegex(fPrefix) + "(" + dRule + ")" + escapeRegex(fSuffix) + "$", "i");

						var files = folder.getFiles();
						for (var f = 0; f < files.length; f++) {
							if (files[f] instanceof File) {
								var m = files[f].name.match(fRx);
								if (m) {
									versions.push({
										version: m[1],
										path: files[f].fsName
									});
								}
							}
						}
					}
				}
			}

			var seen = {};
			var uniqueVersions = [];
			for (var u = 0; u < versions.length; u++) {
				var key = versions[u].version.toLowerCase();
				if (!seen[key]) {
					seen[key] = true;
					uniqueVersions.push(versions[u]);
				}
			}

			uniqueVersions.sort(function(a, b) {
				var numA = parseFloat(a.version.replace(/\D/g, "")) || 0;
				var numB = parseFloat(b.version.replace(/\D/g, "")) || 0;
				return numA - numB;
			});

			debugText("[DEBUG] scanVersions -> Total unique versions found: " + uniqueVersions.length);
			return uniqueVersions;
		}

		function updateAllInputWidths() {
			var maxWidth = 100;
			for (var i = 0; i < managedItems.length; i++) {
				var w = managedItems[i].input.preferredSize[0];
				if (w > maxWidth) maxWidth = w;
			}
			for (var j = 0; j < managedItems.length; j++) {
				managedItems[j].input.size = [maxWidth, 25];
			}
		}

		function updateDebugVisibility() {
			var showDbg = debugCb.value;
			for (var i = 0; i < managedItems.length; i++) {
				managedItems[i].debug.visible = showDbg;
			}
			panel.layout.layout(true);
			panel.layout.resize();
		}

		debugCb.onClick = function() {
			updateDebugVisibility();
		};

		function removeManagedItem(dataObj) {
			if (dataObj.item) {
				dataObj.item.comment = "";
			}
			scrollPanel.remove(dataObj.row);
			for (var m = 0; m < managedItems.length; m++) {
				if (managedItems[m] === dataObj) {
					managedItems.splice(m, 1);
					break;
				}
			}
		}

		function addFootageToUI(ftItem) {
			for (var m = 0; m < managedItems.length; m++) {
				if (managedItems[m].item.id === ftItem.id) return;
			}

			var row = scrollPanel.add("group", undefined);
			row.orientation = "row";
			row.alignChildren = ["left", "center"];
			row.alignment = ["fill", "top"];

			var itemCheckbox = row.add("checkbox", undefined, "");
			itemCheckbox.size = [20, 25];

			var nameLabel = row.add("statictext", undefined, ftItem.name);
			nameLabel.size = [110, 25];

			var initialPattern = "";
			try {
				if (ftItem.comment && ftItem.comment.indexOf("{version") !== -1) {
					initialPattern = ftItem.comment;
				} else {
					initialPattern = autoDetectPattern(ftItem.file.fsName);
					ftItem.comment = initialPattern;
				}
			} catch (e) {
				initialPattern = autoDetectPattern(ftItem.file.fsName);
			}

			var patternInput = row.add("edittext", undefined, initialPattern);
			patternInput.alignment = ["fill", "center"];
			patternInput.minimumSize = [180, 25];
			patternInput.helpTip = UI_CONFIG.helpTips.patternInput;

			patternInput.onChange = (function(itemRef, inputRef) {
				return function() {
					itemRef.comment = inputRef.text;
				};
			})(ftItem, patternInput);

			var dropdown = row.add("dropdownlist", undefined, [UI_CONFIG.defaultDropdownItem]);
			dropdown.size = [90, 25];
			dropdown.selection = 0;
			dropdown.helpTip = UI_CONFIG.helpTips.dropdown;

			var checkBtn = row.add("button", undefined, UI_CONFIG.labels.rowCheck);
			checkBtn.size = [30, 25];
			checkBtn.helpTip = UI_CONFIG.helpTips.rowCheckBtn;

			var updateBtn = row.add("button", undefined, UI_CONFIG.labels.rowUpdate);
			updateBtn.size = [30, 25];
			updateBtn.helpTip = UI_CONFIG.helpTips.rowUpdateBtn;

			var browseBtn = row.add("button", undefined, UI_CONFIG.labels.rowBrowse);
			browseBtn.size = [30, 25];
			browseBtn.helpTip = UI_CONFIG.helpTips.rowBrowseBtn;

			var showInProjectBtn = row.add("button", undefined, UI_CONFIG.labels.rowShowInProject);
			showInProjectBtn.size = [30, 25];
			showInProjectBtn.helpTip = UI_CONFIG.helpTips.rowShowInProjectBtn;

			var removeBtn = row.add("button", undefined, UI_CONFIG.labels.rowRemove);
			removeBtn.size = [30, 25];
			removeBtn.helpTip = UI_CONFIG.helpTips.rowRemoveBtn;

			var debugLabel = row.add("statictext", undefined, UI_CONFIG.initDebugLabel);
			debugLabel.size = [80, 25];
			debugLabel.visible = debugCb.value;

			var dataObj = {
				item: ftItem,
				row: row,
				checkbox: itemCheckbox,
				dropdown: dropdown,
				input: patternInput,
				debug: debugLabel,
				nameLabel: nameLabel,
				hasNewVersion: false
			};
			managedItems.push(dataObj);
			updateAllInputWidths();

			var performCheck = function() {
				var pat = patternInput.text;
				ftItem.comment = pat;
				debugText("[DEBUG] Clicked Check for: " + ftItem.name);
				var found = scanVersions(pat, ftItem.name);

				var currentSelectedPath = null;
				if (dropdown.selection && dropdown.selection.filePath) {
					currentSelectedPath = dropdown.selection.filePath;
				}

				var activeFilePath = ftItem.file ? ftItem.file.fsName.replace(/\\/g, "/").toLowerCase() : "";

				dropdown.removeAll();

				if (found.length > 0) {
					var currentVersionIndex = -1;
					var restoredSelectionIndex = -1;

					for (var v = 0; v < found.length; v++) {
						var normalizedFoundPath = found[v].path.replace(/\\/g, "/").toLowerCase();
						var isCurrent = (activeFilePath !== "" && normalizedFoundPath === activeFilePath);
						var displayLabel = isCurrent ? ("[" + found[v].version + "]") : found[v].version;

						var addedItem = dropdown.add("item", displayLabel);
						addedItem.filePath = found[v].path;

						if (isCurrent) {
							currentVersionIndex = v;
						}
						if (currentSelectedPath && found[v].path === currentSelectedPath) {
							restoredSelectionIndex = v;
						}
					}

					if (restoredSelectionIndex !== -1) {
						dropdown.selection = restoredSelectionIndex;
					} else if (currentVersionIndex !== -1) {
						dropdown.selection = currentVersionIndex;
					} else {
						dropdown.selection = 0;
					}

					var isLatest = (currentVersionIndex === found.length - 1);

					if (!isLatest && found.length > 1) {
						dataObj.hasNewVersion = true;
						nameLabel.graphics.foregroundColor = nameLabel.graphics.newPen(nameLabel.graphics.PenType.SOLID_COLOR, [1, 0.2, 0.2, 1], 1);
						debugLabel.text = "[Old / New avail]";
					} else {
						dataObj.hasNewVersion = false;
						nameLabel.graphics.foregroundColor = nameLabel.graphics.newPen(nameLabel.graphics.PenType.SOLID_COLOR, [1, 1, 1, 1], 1);
						debugLabel.text = "[Latest]";
					}
				} else {
					dropdown.add("item", UI_CONFIG.noVersionsItem);
					dropdown.selection = 0;
					nameLabel.graphics.foregroundColor = nameLabel.graphics.newPen(nameLabel.graphics.PenType.SOLID_COLOR, [0, 0, 0, 1], 1);
					debugLabel.text = "[0 found]";
					debugText("[DEBUG] performCheck -> No versions populated for " + ftItem.name);
				}
				panel.layout.layout(true);
				panel.layout.resize();
			};

			checkBtn.onClick = performCheck;

			updateBtn.onClick = function() {
				if (dropdown.selection && dropdown.selection.filePath) {
					var newFile = new File(dropdown.selection.filePath);
					if (newFile.exists) {
						app.beginUndoGroup("Update Footage Version Sequence");
						var options = new ImportOptions(newFile);
						if (options.canImportAs(ImportAsType.FOOTAGE)) {
							ftItem.replaceWithSequence(newFile, false);
						} else {
							ftItem.replace(newFile);
						}
						ftItem.comment = patternInput.text;
						app.endUndoGroup();
						debugLabel.text = "[Updated]";
						performCheck();
						alert("Updated to version: " + dropdown.selection.text);
					} else {
						debugLabel.text = "[Missing file]";
						alert("Selected file does not exist on disk.");
					}
				} else {
					debugLabel.text = "[No selection]";
					alert("Please check and select a version first.");
				}
				panel.layout.layout(true);
				panel.layout.resize();
			};

			browseBtn.onClick = function() {
				var pat = patternInput.text;
				var idx = pat.indexOf("{version");
				if (idx !== -1) {
					var folderPath = pat.substring(0, pat.lastIndexOf("/", idx));
					if (!folderPath) folderPath = pat.substring(0, pat.lastIndexOf("\\", idx));
					var targetFolder = new Folder(folderPath);
					if (targetFolder.exists) {
						targetFolder.execute();
						debugLabel.text = "[Browsed]";
					} else {
						var fileObj = new File(pat);
						if (fileObj.parent.exists) {
							fileObj.parent.execute();
							debugLabel.text = "[Browsed]";
						} else {
							debugLabel.text = "[Bad folder]";
							alert("Folder does not exist.");
						}
					}
				} else {
					debugLabel.text = "[Invalid pat]";
				}
				panel.layout.layout(true);
				panel.layout.resize();
			};

			showInProjectBtn.onClick = function() {
				try {
					if (!app.project || !ftItem) {
						debugLabel.text = "[Select Error]";
						return;
					}
					// Deselect currently selected project items first so only the target item is selected
					for (var i = 1; i <= app.project.numItems; i++) {
						app.project.item(i).selected = false;
					}
					ftItem.selected = true;
					debugLabel.text = "[Selected in Proj]";
				} catch (e) {
					debugText("[DEBUG] showInProject error: " + e.toString());
					debugLabel.text = "[Select Error]";
				}
				panel.layout.layout(true);
				panel.layout.resize();
			};

			removeBtn.onClick = function() {
				removeManagedItem(dataObj);
				panel.layout.layout(true);
				panel.layout.resize();
			};

			panel.layout.layout(true);
			panel.layout.resize();
		}

		addSelectedBtn.onClick = function() {
			debugText("[DEBUG] Clicked 'Add selected'");
			var filter = filterInput.text;
			if (app.project && app.project.selection) {
				var sel = app.project.selection;
				for (var s = 0; s < sel.length; s++) {
					var item = sel[s];
					if (item instanceof FootageItem && item.file && item.file.exists) {
						if (!filter || matchWildcard(item.name, filter)) {
							addFootageToUI(item);
						}
					}
				}
			}
		};

		addAllBtn.onClick = function() {
			debugText("[DEBUG] Clicked 'Add all with filter:'");
			var filter = filterInput.text;
			if (app.project) {
				for (var i = 1; i <= app.project.numItems; i++) {
					var item = app.project.item(i);
					if (item instanceof FootageItem && item.file && item.file.exists) {
						if (!filter || matchWildcard(item.name, filter)) {
							addFootageToUI(item);
						}
					}
				}
			}
		};

		selectAllCb.onClick = function() {
			var val = selectAllCb.value;
			selectAllCb.text = val ? UI_CONFIG.labels.selectNone : UI_CONFIG.labels.selectAll;
			for (var i = 0; i < managedItems.length; i++) {
				managedItems[i].checkbox.value = val;
			}
		};

		checkSelectedBtn.onClick = function() {
			for (var i = 0; i < managedItems.length; i++) {
				if (managedItems[i].checkbox.value) {
					managedItems[i].row.children[4].notify("onClick");
				}
			}
		};

		useHighestBtn.onClick = function() {
			for (var i = 0; i < managedItems.length; i++) {
				if (managedItems[i].checkbox.value) {
					var dd = managedItems[i].dropdown;
					if (dd.items.length > 0) {
						var targetIndex = dd.items.length - 1;
						if (dd.items[targetIndex].toString() !== UI_CONFIG.noVersionsItem) {
							dd.selection = targetIndex;
							managedItems[i].row.children[5].notify("onClick");
						}
					}
				}
			}
		};

		clearSelectedBtn.onClick = function() {
			var toRemove = [];
			for (var i = 0; i < managedItems.length; i++) {
				if (managedItems[i].checkbox.value) {
					toRemove.push(managedItems[i]);
				}
			}
			for (var r = 0; r < toRemove.length; r++) {
				removeManagedItem(toRemove[r]);
			}
			panel.layout.layout(true);
			panel.layout.resize();
		};

		writeCsvBtn.onClick = function() {
			var projectName = "project";
			if (app.project && app.project.file) {
				var pNameFull = app.project.file.name;
				var lastDot = pNameFull.lastIndexOf(".");
				if (lastDot !== -1) {
					projectName = pNameFull.substring(0, lastDot);
				} else {
					projectName = pNameFull;
				}
			}
			var defaultFilename = projectName + "_footages.csv";
			var desktopFolder = Folder.desktop;
			var defaultFile = new File(desktopFolder.fsName + "/" + defaultFilename);

			var file = defaultFile.saveDlg("Save Footage Manager CSV", "*.csv");
			if (file) {
				file.open("w");
				file.writeln("FootageName,FilePath,PatternComment");
				for (var i = 0; i < managedItems.length; i++) {
					var mi = managedItems[i];
					var fName = mi.item.name.replace(/,/g, "");
					var fPath = mi.item.file ? mi.item.file.fsName.replace(/,/g, "") : "";
					var fPattern = mi.input.text.replace(/,/g, "");
					file.writeln(fName + "," + fPath + "," + fPattern);
				}
				file.close();
				alert("Successfully wrote CSV file to: " + file.fsName);
			}
		};

		loadCsvBtn.onClick = function() {
			var file = File.openDialog("Open Footage Manager CSV", "*.csv");
			if (file && file.exists) {
				file.open("r");
				file.readln(); // skip header
				while (!file.eof) {
					var line = file.readln();
					if (!line) continue;
					var parts = line.split(",");
					if (parts.length >= 2) {
						var targetName = parts[0];
						var targetPattern = parts[2];

						var foundItem = null;
						if (app.project) {
							for (var i = 1; i <= app.project.numItems; i++) {
								var item = app.project.item(i);
								if (item instanceof FootageItem && item.name === targetName && item.file && item.file.exists) {
									foundItem = item;
									break;
								}
							}
						}

						if (foundItem) {
							addFootageToUI(foundItem);
							if (targetPattern) {
								for (var m = 0; m < managedItems.length; m++) {
									if (managedItems[m].item.id === foundItem.id) {
										managedItems[m].input.text = targetPattern;
										foundItem.comment = targetPattern;
										break;
									}
								}
							}
						}
					}
				}
				file.close();
				alert("Successfully loaded and synced from CSV file.");
			}
		};

		panel.onActivate = function() {
			checkDiskAccessPref();
		};

		panel.layout.layout(true);
		panel.layout.resize();
		panel.onResizing = panel.onResize = function() {
			this.layout.resize();
		};

		return panel;
	}

	var footageManagerPanel = buildFootageManagerPanel(thisObj);
	if (footageManagerPanel instanceof Window) {
		footageManagerPanel.center();
		footageManagerPanel.show();
	}
})(this);
