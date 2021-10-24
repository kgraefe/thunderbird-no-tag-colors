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

var notagcolors = class extends ExtensionCommon.ExtensionAPI {
	getAPI(context) {
		return {
			notagcolors: {
				disableTagColors() {
					// Preserve tag colors from being injects again
					TagUtils.loadTagsIntoCSS = function(aDocument){};
					TagUtils.addTagToAllDocumentSheets = function(aKey, aColor){};

					// Remove all the tag colors
					for (let nextWin of Services.wm.getEnumerator("mail:3pane", true)) {
						var tagSheet = findTagColorSheet(nextWin.document);
						if (tagSheet) {
							while (tagSheet.cssRules.length > 0) {
								tagSheet.deleteRule(0);
							}
						}
					}
				}
			}
		}
	}
};
