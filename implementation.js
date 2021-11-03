var { TagUtils } = ChromeUtils.import("resource:///modules/TagUtils.jsm");

function findTagColorSheet(aDocument) {
  const cssUri = "chrome://messenger/skin/tagColors.css";
  let tagSheet = null;
  for (let sheet of aDocument.styleSheets) {
    if (sheet.href == cssUri) {
      tagSheet = sheet;
      break;
    }
  }
  return tagSheet;
}

function removeAllTagColors(aSheet) {
	while (aSheet.cssRules.length > 0) {
		aSheet.deleteRule(0);
	}
}

function copyUntaggedStyle(sourceSheet, targetSheet) {
	for (let rule of sourceSheet.rules) {
		if (rule.type == 3) { // Import
			copyUntaggedStyle(rule.styleSheet, targetSheet);
		}
		if (rule.type == 1) {
			let selector = rule.selectorText;
			if (selector.includes("untagged")) {
				targetSheet.insertRule(
					rule.cssText.replace(/\buntagged\b/, "tagged")
				);
			}
		}
	}
}

var notagcolors = class extends ExtensionCommon.ExtensionAPI {
	getAPI(context) {
		return {
			notagcolors: {
				disableTagColors() {
					// Preserve tag colors from being injects again
					TagUtils.loadTagsIntoCSS = function(aDocument){};
					TagUtils.addTagToAllDocumentSheets = function(aKey, aColor){};

					for (let nextWin of Services.wm.getEnumerator("mail:3pane", true)) {
						var tagColorSheet = findTagColorSheet(nextWin.document);
						if (tagColorSheet) {
							// Remove all the tag colors
							removeAllTagColors(tagColorSheet);

							// ... and copy the style of untagged messages.
							for (let sheet of nextWin.document.styleSheets) {
								copyUntaggedStyle(sheet, tagColorSheet);
							}

							// Add rule for tag toolbar dropdown
							tagColorSheet.insertRule(
								"#button-tag menuitem { color: inherit !important; }"
							);

							// Add rule for quick filter toolbar
							tagColorSheet.insertRule(
								".qfb-tag-button .toolbarbutton-text { color: var(--lwt-text-color); }"
							);
						}
					}
				}
			}
		}
	}
};
