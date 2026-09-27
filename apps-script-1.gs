/**
 * GOOGLE APPS SCRIPT — Wedding RSVP Backend
 * ------------------------------------------------------------
 * SETUP (do this once):
 * 1. Create a new Google Sheet. Rename the first tab to "RSVP".
 * 2. In the sheet, add this header row in row 1:
 *    Timestamp | Name | Attending | Guests | Message
 * 3. Open Extensions > Apps Script. Delete any starter code and
 *    paste this whole file in.
 * 4. Click Deploy > New deployment > select type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click Deploy, authorize the permissions Google asks for,
 *    and copy the Web app URL it gives you.
 * 6. Paste that URL into CONFIG.scriptURL in index.html.
 * ------------------------------------------------------------
 */

const SHEET_NAME = "RSVP";

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Attending", "Guests", "Message"]);
  }
  return sheet;
}

// Handles RSVP submissions from the form (POST)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action !== "rsvp") {
      return jsonResponse({ error: "Unknown action" });
    }
    const sheet = getSheet();
    sheet.appendRow([
      new Date(),
      data.name || "",
      data.attending || "",
      data.guests || "",
      data.message || ""
    ]);
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

// Handles reading the wishes list back for the "Ucapan" section (GET)
function doGet(e) {
  const action = e.parameter.action;
  if (action === "list") {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    rows.shift(); // remove header row
    const items = rows
      .filter(r => r[1]) // must have a name
      .map(r => ({
        name: r[1],
        attending: r[2],
        guests: r[3],
        message: r[4]
      }));
    return jsonResponse({ items: items });
  }
  return jsonResponse({ status: "Wedding RSVP API is running." });
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
